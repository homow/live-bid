import "reflect-metadata";
import {describe, expect, it, vi} from "vitest";
import {PATTERN_METADATA} from "@nestjs/microservices/constants";

/**
 * The controllers are supposed to be thin: pick the right pieces out of the
 * payload, call one service method, return its result. These tests pin exactly that,
 * including which message pattern lands on which handler.
 */

const patternOf = (handler: unknown) => Reflect.getMetadata(PATTERN_METADATA, handler as object);

const clientInfo = {ip: "203.0.113.7"};

describe("AuthController", () => {

});
