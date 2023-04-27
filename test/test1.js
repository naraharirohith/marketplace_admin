const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function() {
  let marketplace;
  let owner;
  let buyer;
  let item;

  beforeEach(async function() {
    [owner, buyer] = await ethers.getSigners();

    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy();
    await marketplace.deployed();

    await marketplace.addItem("Item 1", "Category 1", "Description 1", "imageHash", ethers.utils.parseEther("1"), 1);

    item = await marketplace.items(1);
  });

  it("should increase owner's balance after delivering item", async function() {
    // Buy the item
    await marketplace.connect(buyer).buyItem(item.itemId, { value: item.price });

    // Get owner's balance before delivering the item
    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

    // Deliver the item
    await marketplace.connect(buyer).deliverItem(item.itemId, 0);

    // Get owner's balance after delivering the item
    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

    // Calculate the expected balance increase
    const expectedBalanceIncrease = ethers.BigNumber.from(item.price);

    // Check that the owner's balance has increased by the expected amount
    expect(ownerBalanceAfter).to.equal(ownerBalanceBefore.add(expectedBalanceIncrease));
  });
});
