import { defineMcp } from "@lovable.dev/mcp-js";
import searchListings from "./tools/search-listings";
import getListing from "./tools/get-listing";
import getBay from "./tools/get-bay";

export default defineMcp({
  name: "nairabay",
  title: "nairabay",
  version: "0.1.0",
  instructions:
    "Read-only tools for Nairabay, a Nigerian marketplace. Search active listings, view a listing, and view a seller's public Bay# page. Prices are in Naira (₦).",
  tools: [searchListings, getListing, getBay],
});
