import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { JWT_SECRET } from '../constant';
import { TEST_POLKADOT_ADDRESS } from '~/config';

// Define the shape of the options object for better type safety
type AuthTokenOptions = {
  returnId?: boolean;
};

// Define the shape of the return object when returnId is true
type AuthTokenResponse = {
  token: string;
  userId: mongoose.Types.ObjectId;
};

export const polkadotAddress = TEST_POLKADOT_ADDRESS;

/**
 * A reusable test helper to simulate a logged-in user.
 * This function creates a new user with a Polkadot address in the database 
 * and returns a signed JWT token for that user.
 * * @param options - Optional: Set `returnId` to true to also get the created user's ID.
 * @returns A token string, or an object with the token and userId if `returnId` is true.
 */
export const getAuthToken = async (
  options: AuthTokenOptions = {}
): Promise<AuthTokenResponse> => {
  // 1. Define user details
  const userId = new mongoose.Types.ObjectId();

  // 2. Create and save the user to the in-memory test database
  const user = new User({
    _id: userId,
    addresses: [polkadotAddress],
  });
  await user.save();

  // 3. Create the JWT token payload
  const payload = { id: userId.toHexString() };

  // 4. Sign the token using your secret
  const token = jwt.sign(payload, JWT_SECRET);
  
  // 5. Return the required values
  return { token, userId };
};