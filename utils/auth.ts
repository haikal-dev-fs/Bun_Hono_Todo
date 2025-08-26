import * as jose from "jose";
import type { JWTPayload } from "jose";
// use bcryptjs (pure JS) to avoid native N-API/binary incompatibilities (e.g. in Bun)
import * as bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "superduperSecret")

export const generateToken = async (payload: JWTPayload) => {
    return await new jose.SignJWT(payload)
    .setProtectedHeader({alg: "HS256"})
    .setExpirationTime("12h")
    .sign(JWT_SECRET);
}

export const verifyToken = async (token: string) => {
    try {
        const {payload} = await jose.jwtVerify(token, JWT_SECRET);
        return payload;
    } catch {
        return null;
    }
}

export const hashPassword = async (password: string) => {
    if (!password || typeof password !== "string") {
        throw new Error("Invalid password: must be a non-empty string");
    }
    return await bcrypt.hash(password, 10);
}

export const comparePassword = async (password: string, hash: string) => {
    return await new Promise<boolean>((resolve, reject) => {
        bcrypt.compare(password, hash, (err: Error | null, res: boolean) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
}

export const getUserIdFromToken = async (token: string) => {
    const payload = await verifyToken(token);
    return payload ? payload.id : null;
}
