import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const contractName = "WrappedScarcity";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const WrappedScarcity = await deploy(contractName, {
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = [contractName];
