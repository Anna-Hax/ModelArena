const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const ArenaModule = buildModule("ArenaModule", (m) => {
  // Deploy the Arena contract
  const arena = m.contract("Arena", []);

  // Optional: Set up additional backend role addresses after deployment
  // Uncomment and modify these if you want to grant BACKEND_ROLE to specific addresses
  
  // const backendAddress1 = m.getParameter("backendAddress1", "0x0000000000000000000000000000000000000000");
  // const backendAddress2 = m.getParameter("backendAddress2", "0x0000000000000000000000000000000000000000");
  
  // // Grant BACKEND_ROLE to additional addresses (if provided)
  // if (backendAddress1 !== "0x0000000000000000000000000000000000000000") {
  //   m.call(arena, "grantRole", [
  //     "0x5b058d3dbdcb75e03bc12298b5b3ea8c4c9b0c3c3a8e6f9b4b3a0c2e1f2d3c4b5", // BACKEND_ROLE hash
  //     backendAddress1
  //   ]);
  // }
  
  // if (backendAddress2 !== "0x0000000000000000000000000000000000000000") {
  //   m.call(arena, "grantRole", [
  //     "0x5b058d3dbdcb75e03bc12298b5b3ea8c4c9b0c3c3a8e6f9b4b3a0c2e1f2d3c4b5", // BACKEND_ROLE hash
  //     backendAddress2
  //   ]);
  // }

  return { arena };
});

module.exports = ArenaModule;