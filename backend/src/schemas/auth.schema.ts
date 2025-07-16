import { z } from 'zod';

export const polkadotLoginSchema = z.object({
  body: z.object({
    address: z.string().nonempty('Address is required'),
    message: z.string().nonempty('Message is required'),
    signature: z.string().nonempty('Signature is required'),
  }),
});

export type PolkadotLoginInput = z.infer<typeof polkadotLoginSchema>['body'];

// You can add more schemas here, e.g. for refresh if you want to validate headers or body
