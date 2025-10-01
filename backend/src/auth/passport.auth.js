"use strict";
import passport from "passport";
import Bombero from "../entities/bombero.entity.js";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";
import { AppDataSource } from "../config/configDb.js";

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ACCESS_TOKEN_SECRET,
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      const bomberoRepository = AppDataSource.getRepository(Bombero);
      const bombero = await bomberoRepository.findOne({
        where: {
          run: jwt_payload.run,
        },
        relations: {
          roles: {
            permisos: true
          }
        }
      });

      if (bombero) {
        return done(null, bombero);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  }),
);

export function passportJwtSetup() {
  passport.initialize();
}
