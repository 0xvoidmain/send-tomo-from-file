// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external;
    function transferFrom(address sender, address recipient, uint256 amount) external;
    function balanceOf(address add) external view returns (uint);
    function approve(address spender, uint256 amount) external;
}

contract MultipleSend {
    address payable public _owner;
    constructor(address _ownerAddress) {
        _owner = payable(_ownerAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }

    function setOwner(address payable _newOwner) external onlyOwner {
        require(_newOwner != address(0));
        _owner = _newOwner;
    }
    
    function withdraw(address _token, address payable _to) external onlyOwner {
        if (_token == address(0x0)) {
            payable(_to).transfer(address(this).balance);
        }
        else {
            IERC20(_token).transfer(_to, IERC20(_token).balanceOf(address(this)));
        }
    }

    function send(address token, uint256 decimails, uint[] memory amounts, address[] memory adds) public onlyOwner {
        for (uint i = 0; i < adds.length; i++) {
            IERC20(token).transfer(adds[i], amounts[i] * (10 ** decimails));
        }
    }

    function sendFrom(address token, uint256 decimails, uint[] memory amounts, address[] memory adds) public onlyOwner {
        for (uint i = 0; i < adds.length; i++) {
            IERC20(token).transferFrom(_owner, adds[i], amounts[i] * (10 ** decimails));
        }
    }
}
