// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {

    struct Item {
        uint256 itemId;
        string name;
        string category;
        string description;
        string imageHash;
        address payable seller;
        uint price;
        uint supply;
    }

    struct SingleProductDetails {
        address buyer;
        bool isSold;
        bool isDelivered;
    }

    mapping (uint256 => Item) public items;

    // itemId => supplyId => product details
    mapping(uint => mapping(uint => SingleProductDetails)) public productDetails;
    
    uint256 public itemCount;

    address public owner;

    event ItemAdded(uint256 itemId, string name, string category, string description, string imageHash, address seller, uint price, uint supply);
    event ItemBought(uint256 itemId, uint supplyId, address buyer);
    event ItemDelivered(uint256 itemId, uint supplyId);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    function addItem(
        string memory _name, 
        string memory _category, 
        string memory _description, 
        string memory _imageHash, 
        uint _price, 
        uint _supply
        ) public onlyOwner {
        
        itemCount++;
        require(_supply > 0, "Supply should be atleast 1");
        items[itemCount] = Item(itemCount, _name, _category, _description, _imageHash, payable(msg.sender), _price, _supply);
        
        emit ItemAdded(itemCount, _name, _category, _description, _imageHash, msg.sender, _price, _supply);
    }

    function buyItem(uint256 _itemId) public payable {
        uint _supplyId = items[_itemId].supply;

        require(items[_itemId].itemId != 0, "Item does not exist");
        require(!productDetails[_itemId][_supplyId].isSold, "Item already sold");
        require(items[_itemId].supply > 0, "Item out of stock");
        require(msg.value == items[_itemId].price, "Incorrect amount sent");

        productDetails[_itemId][_supplyId] = SingleProductDetails(msg.sender, true, false);
        items[_itemId].supply--;

        emit ItemBought(_itemId, _supplyId, msg.sender);
    }

    function deliverItem(uint256 _itemId, uint _supplyId) public {
        require(items[_itemId].itemId != 0, "Item does not exist");
        require(productDetails[_itemId][_supplyId].isSold, "Item has not been sold");
        require(msg.sender == productDetails[_itemId][_supplyId].buyer, "Only the buyer can perform this action");

        productDetails[_itemId][_supplyId].isDelivered = true;

        payable(owner).transfer(items[_itemId].price);

        emit ItemDelivered(_itemId, _supplyId);
    }
}
