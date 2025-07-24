import { getClient } from "@kodadot1/uniquery";
import { HttpError } from "~/errors/HttpError";
import { logger } from "~/utils/logger";

const validChains = ["ksm", "ahk", "dot", "ahp", "imx", "base", "mnt"] as const;
export type Prefix = (typeof validChains)[number];

export type NftEvent = {
  id: string;
  interaction: string;
  timestamp: string;
  caller: string;
  meta: string;
};

export type NftMeta = {
  id: string;
  name: string;
  description: string;
  image: string;
  animationUrl: string | null;
  type: string;
};

export type NftCollection = {
  id: string;
  name: string;
  max: number;
};

// 2. Define the top‑level NFT item
export type NftItem = {
  id: string;
  name: string;
  price: string;
  currentOwner: string;
  issuer: string;
  metadata: string;
  meta: NftMeta;
  collection: NftCollection;
  createdAt: string;
  updatedAt: string;
  events: NftEvent[];
};

type ReturnType = {
  data: NftItem[];
  totalCount: number;
};

export async function getOwnedNfts(
  ownerAddress: string,
  chain: Prefix = "dot"
): Promise<ReturnType> {
  try {
    if (
      !ownerAddress ||
      ownerAddress.trim() === "" ||
      ownerAddress.length < 3 ||
      typeof ownerAddress !== "string"
    ) {
      throw new HttpError(
        400,
        "Owner address is required and must be a valid string."
      );
    }

    // 1. Validate the chain prefix
    if (!validChains.includes(chain)) {
      throw new HttpError(
        400,
        `Invalid chain prefix: ${chain}. Valid options are: ${validChains.join(
          ", "
        )}`
      );
    }

    const client = getClient(chain);

    logger.info(`Querying for NFTs owned by ${ownerAddress} on ${chain}...`);
    const query = client.itemListByOwner(ownerAddress, {
      fields: [
        "id",
        "name",
        "price",
        "currentOwner",
        "issuer",
        "metadata",
        "meta",
        "collection { id, name, max }" as any,
        "createdAt",
        "updatedAt",
        "events(limit: 5, orderBy: timestamp_DESC) { id, interaction, timestamp, caller, meta }",
      ],
      orderBy: "createdAt_DESC",
    });

    // 5. Fetch the data from the Subsquid endpoint
    const result = (await client.fetch(query)) as {
      data: {
        items: NftItem[];
      };
    };

    if (
      !result ||
      !result.data ||
      !result?.data?.items ||
      typeof result.data?.items !== "object"
    ) {
      throw new HttpError(500, "No data returned from Kodadot API");
    }

    // 6. Log the result
    logger.info("✅ Success! Found NFTs:", {length: result.data.items.length});
    return {
      data: result.data.items as NftItem[],
      totalCount: result.data.items.length || 0,
    };
  } catch (error) {
    logger.error("❌ Error fetching NFTs:", { error });
    throw new HttpError(500, "Failed to fetch NFTs from Kodadot");
  }
}
