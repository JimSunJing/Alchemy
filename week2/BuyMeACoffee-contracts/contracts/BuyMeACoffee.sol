// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// contract address on goerli: 0x2288829BfFDD2250E080393041D1b588743d64cf
// contract address after challenge done: 0x18C25A8cf9f31098C40E8fA75e5d93DDeE613d2E

contract BuyMeACoffee {

  // emit this event when new memo sended to this contract
  event NewMemo (
    address indexed from,
    uint256 timestamp,
    string message,
    string name
  );


  // define a memo type
  struct Memo {
    address from;
    uint256 timestamp;
    string message;
    string name;
  }


  // withdraw address
  address payable owner;


  // List of memo from people
  // will be saved into blockchain
  Memo[] memos;


  // constructor will run when deploy.
  // set owner of this contract
  constructor() {
    owner = payable(msg.sender);
  }


  /**
    * @dev dApp can use this function to see memos
   */
  function getMemos() public view returns (Memo[] memory) {
    return memos;
  }


  /**
   * @dev buy a coffee (send eth to contract and leave a message) 
   * @param _name who buy the coffee
   * @param _message buyer leave message
   */
  function buyCoffee(string memory _name, string memory _message) public payable {
    require(msg.value > 0, "you can't buy coffee for free");
    
    memos.push(Memo(
      msg.sender,
      block.timestamp,
      _message,
      _name
    ));

    emit NewMemo(msg.sender, block.timestamp, _message, _name);
  }


  /**
   * @dev withdraw contract eth to owner wallet
   */
  function withdraw() public {
    require(owner.send(address(this).balance));
  }


  /**
   * @dev allow current owner to update withdrawl address
   * @param _address new address for withdrawl, also change owner
   * 
   * For Road to web3 Challenge 1
   */
  function updateOwner(address _address) public {
    require(payable(msg.sender) == owner, "only owner can change withdrawl address");
    owner = payable(_address);
  }

}

