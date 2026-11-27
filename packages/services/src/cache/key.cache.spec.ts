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

  describe("buildVersionedListKey", () => {
    const inputs = {limit: 10, page: 1, orderBy: "created_at", sortBy: "desc"};

    it("has the list marker and the version in it", () => {
      expect(RedisKey.buildVersionedListKey({resource: "user", version: 3, inputs: {limit: 10, page: 1}})).toBe(
        "user:v=3:list:limit=10:page=1",
      );
    });

    it("is the same for the same query, however the inputs are ordered", () => {
      const one = RedisKey.buildVersionedListKey({resource: "user", version: 1, inputs});
      const two = RedisKey.buildVersionedListKey({
        resource: "user",
        version: 1,
        inputs: {sortBy: "desc", orderBy: "created_at", page: 1, limit: 10},
      });

      expect(one).toBe(two);
    });

    it("changes with the version, which is how a whole list cache gets thrown away at once", () => {
      const v1 = RedisKey.buildVersionedListKey({resource: "user", version: 1, inputs});
      const v2 = RedisKey.buildVersionedListKey({resource: "user", version: 2, inputs});

      expect(v1).not.toBe(v2);
    });

    it.each([
      ["another page", {...inputs, page: 2}],
      ["another page size", {...inputs, limit: 20}],
      ["another sort direction", {...inputs, sortBy: "asc"}],
      ["a role filter", {...inputs, role: "ADMIN"}],
      ["is_active false", {...inputs, is_active: false}],
      ["is_active true", {...inputs, is_active: true}],
    ])("is different for %s", (_label, other) => {
      const base = RedisKey.buildVersionedListKey({resource: "user", version: 1, inputs});

      expect(RedisKey.buildVersionedListKey({resource: "user", version: 1, inputs: other})).not.toBe(base);
    });

    it("tells is_active true and false apart from no filter at all", () => {
      const none = RedisKey.buildVersionedListKey({resource: "user", version: 1, inputs});
      const active = RedisKey.buildVersionedListKey({resource: "user", version: 1, inputs: {...inputs, is_active: true}});
      const inactive = RedisKey.buildVersionedListKey({resource: "user", version: 1, inputs: {...inputs, is_active: false}});

      expect(new Set([none, active, inactive]).size).toBe(3);
    });
  });
});
