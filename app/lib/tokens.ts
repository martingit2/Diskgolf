import { getVerificationTokenByEmail } from '@/data/verification-token';
import { v4 as uuidv4 } from 'uuid';
import client from './prismadb';
import { getPasswordResetTokenByEmail } from '@/data/password-reset-token';
import crypto from 'crypto';
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token';




export const generateTwoFactorToken = async (email: string) => {
    const token = crypto.randomInt(100_000, 1_000_000).toString(); // Genenerer twofaktor tall mellom 100k og 1 mill
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000);  // 15 minutter før den blir expired
  
    const existingToken = await getTwoFactorTokenByEmail(email);
  
    if (existingToken) {
      await client.twoFactorToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }
  
    const twoFactorToken = await client.twoFactorToken.create({
      data: {
        email,
        token,
        expires,
      },
    });
  
    return twoFactorToken;
  };

export const generatePasswordResetToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 time
    
    const existingToken = await getPasswordResetTokenByEmail(email);


    if (existingToken) {
        await client.passwordResetToken.delete({
            where: {id: existingToken.id}
        })
    }
    const getPasswordResetToken = await client.passwordResetToken.create({
        data: {
            email,
            token,
            expires
        }
    })
    return getPasswordResetToken;
}


export const generateVerificationToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 time
  
    const existingToken = await getVerificationTokenByEmail(email);
  
    if (existingToken) {
      await client.verificationToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }

    const verificationToken = await client.verificationToken.create({
        data: {
          email,
          token,
          expires,
        },
      });
    
      return verificationToken;
    };
