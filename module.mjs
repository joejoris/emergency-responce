// @ts-check
import { module } from "@prisma/composer";
import emergencyResponseService from "./service.mjs";

export default module("emergency-responce", ({ provision }) => {
  provision(emergencyResponseService, { id: "emergencyresponse" });
});
