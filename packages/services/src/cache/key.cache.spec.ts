import {RedisKey} from "./key.cache";
import {describe, expect, it} from "vitest";

/**
 * Cache keys have to be the same for the same question and different for different
 * questions: a collision means one request gets another request's cached answer.
 */

describe("RedisKey", () => {
  describe("getUserProfileKey", () => {
    it("builds the profile key of one user", () => {
      expect(RedisKey.getUserProfileKey("42")).toBe("user:profile:user-id=42");
    });

    it("gives every user a key of their own", () => {
      expect(RedisKey.getUserProfileKey("1")).not.toBe(RedisKey.getUserProfileKey("2"));
    });
  });

  describe("build", () => {
    it("joins the parts under the resource", () => {
      expect(RedisKey.build("user", "session", "userId=1")).toBe("user:session:userId=1");
    });

    it("leaves out empty, null and undefined parts, so there are no double colons", () => {
      expect(RedisKey.build("user", "a", "", null, undefined, "b")).toBe("user:a:b");
    });

    it("trims each part", () => {
      expect(RedisKey.build("user", "  padded  ")).toBe("user:padded");
    });
  });
  describe("getUserProfileKey", () => {
    it("builds the profile key of one user", () => {
      expect(RedisKey.getUserProfileKey("42")).toBe("user:profile:user-id=42");
    });

    it("gives every user a key of their own", () => {
      expect(RedisKey.getUserProfileKey("1")).not.toBe(RedisKey.getUserProfileKey("2"));
    });
  });

  describe("build", () => {
    it("joins the parts under the resource", () => {
      expect(RedisKey.build("user", "session", "userId=1")).toBe("user:session:userId=1");
    });

    it("leaves out empty, null and undefined parts, so there are no double colons", () => {
      expect(RedisKey.build("user", "a", "", null, undefined, "b")).toBe("user:a:b");
    });

    it("trims each part", () => {
      expect(RedisKey.build("user", "  padded  ")).toBe("user:padded");
    });
  });

  describe("keyPrefix", () => {
    it("sorts inputs by name, so the order they were written in doesn't matter", () => {
      const one = RedisKey.keyPrefix({resource: "user", inputs: {role: "ADMIN", limit: 10}});
      const two = RedisKey.keyPrefix({resource: "user", inputs: {limit: 10, role: "ADMIN"}});

      expect(one).toBe(two);
      expect(one).toBe("user:limit=10:role=ADMIN");
    });

    it("skips undefined, null and empty inputs", () => {
      const key = RedisKey.keyPrefix({resource: "user", inputs: {a: undefined, b: null, c: "", d: "kept"}});

      expect(key).toBe("user:d=kept");
    });

    it("keeps false and 0, because they are real answers and not 'no filter'", () => {
      const key = RedisKey.keyPrefix({resource: "user", inputs: {is_active: false, page: 0}});

      expect(key).toBe("user:is_active=false:page=0");
    });

    it("puts extra segments first, then the list marker", () => {
      const key = RedisKey.keyPrefix({resource: "user", extraKeys: ["profile"], pagination: true, inputs: {a: 1}});

      expect(key).toBe("user:profile:list:a=1");
    });
  });

});
