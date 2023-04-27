const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
  let marketplace;
  let owner;
  let addr1;
  let addr2;
  let balanceBefore;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy();
    await marketplace.deployed();

    await marketplace.addItem("Item 1", "Category 1", "Description 1", "imagehash1", 100000, 2);
  });

  it("should add an item", async function () {
    const item = await marketplace.items(1);
    expect(item.itemId).to.equal(1);
    expect(item.name).to.equal("Item 1");
    expect(item.category).to.equal("Category 1");
    expect(item.description).to.equal("Description 1");
    expect(item.imageHash).to.equal("imagehash1");
    expect(item.seller).to.equal(owner.address);
    expect(item.price).to.equal(100000);
    expect(item.supply).to.equal(2);
    expect(item.isSold).to.be.false;
    expect(item.isDelivered).to.be.false;
  });

  it("should buy an item", async function () {
    const item = await marketplace.items(1);
    const supplyId = item.supply;
    console.log(supplyId);

    await marketplace.connect(addr1).buyItem(1, { value: item.price });
    const buyer = await marketplace.buyers(1, supplyId -1);
    expect(buyer).to.equal(addr1.address);

    const newItem = await marketplace.items(1);
    expect(newItem.supply).to.equal(supplyId - 1);
    expect(newItem.isSold).to.be.true;
  });
});