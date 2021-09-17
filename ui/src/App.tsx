import { useState, useEffect } from "react";
import {
  Button,
  useColorMode,
  Flex,
  Heading,
  Spacer,
  Container,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  Center,
  useToast,
  Image,
  Box,
  Link,
  Text,
  VStack,
  InputRightElement,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import ConnectWallet from "./components/ConnectWallet";
import { Contract, ethers } from "ethers";
import { Web3Provider, Signer } from "./types";
import Footer from "./components/Footer";
import { wrap } from "module";

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const underlineColor = { light: "gray.500", dark: "gray.400" };
  const bgColor = { light: "white", dark: "gray.700" };
  const toast = useToast();

  const [provider, setProvider] = useState<Web3Provider>();
  const [signer, setSigner] = useState<Signer>();
  const [signerAddress, setSignerAddress] = useState<string>();
  const [id, setId] = useState<number>(1);

  const [scarcity, setScarcity] = useState<Contract>();
  const [wrappedScarcity, setWrappedScarcity] = useState<Contract>();
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<string>();

  const scarcityAddress = "0x4fb729BDb96d735692DCACD9640cF7e3aA859B25";
  const scarcityABI = require("./abi/scarcity.json");
  const wrappedScarcityAddress = "0x1fb41C5e6BaFf8B7A1412DcF3b9d06C22C8Bfe79";
  const wrappedScarcityABI = require("./abi/WrappedScarcity.json");

  useEffect(() => {
    if (provider) {
      setScarcity(new ethers.Contract(scarcityAddress, scarcityABI, provider));
      setWrappedScarcity(
        new ethers.Contract(
          wrappedScarcityAddress,
          wrappedScarcityABI,
          provider
        )
      );
      setSigner(provider.getSigner(0));
    }
  }, [provider]);

  useEffect(() => {
    const getSignerAddress = async () => {
      setSignerAddress(await signer!.getAddress());
    };
    if (signer) {
      getSignerAddress();
    }
  }, [signer]);

  useEffect(() => {
    if (scarcity) {
      fetchImage(id);
    }
  }, [scarcity]);

  const fetchImage = async (_id: number = id) => {
    try {
      const tokenURI = await scarcity!.tokenURI(_id);
      // 29 = length of "data:application/json;base64,"
      const jsonString = Buffer.from(tokenURI.substring(29), "base64").toString(
        "binary"
      );
      const json = JSON.parse(jsonString);
      setImage(json.image);
    } catch {}
  };

  const wrap = async () => {
    setLoading(true);
    await fetchImage();
    try {
      const owner = await scarcity!.ownerOf(id);
      if (owner !== signerAddress) {
        errorToast("You are not the owner of this tokenId");
        return;
      }
    } catch {
      errorToast("Token doesn't exist");
    }

    const isApproved = await scarcity!.isApprovedForAll(
      signerAddress,
      wrappedScarcityAddress
    );
    if (!isApproved) {
      const tx = await scarcity!
        .connect(signer!)
        .setApprovalForAll(wrappedScarcityAddress, true);
      await tx.wait();
    }
    const tx = await wrappedScarcity!.connect(signer!).wrap(id);
    await tx.wait();
    setLoading(false);
  };

  const errorToast = (title: string, description: string = "") => {
    toast({
      title,
      description,
      status: "error",
      isClosable: true,
      duration: 3000,
    });
  };

  return (
    <>
      <Flex
        py="4"
        px={["2", "4", "10", "10"]}
        borderBottom="2px"
        borderBottomColor={underlineColor[colorMode]}
      >
        <Spacer flex="1" />
        <Heading maxW={["302px", "4xl", "4xl", "4xl"]}>
          Summoners Wrapper
        </Heading>
        <Flex flex="1" justifyContent="flex-end">
          <Button onClick={toggleColorMode} rounded="full" h="40px" w="40px">
            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          </Button>
        </Flex>
      </Flex>
      <Container my="16" minH="md" minW={["0", "0", "2xl", "2xl"]}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchImage();
          }}
        >
          <FormControl>
            <FormLabel>Enter tokenId to wrap</FormLabel>
            <InputGroup>
              <Input
                placeholder="tokenId"
                aria-label="tokenId"
                type="number"
                autoComplete="off"
                value={id}
                onChange={(e) => {
                  setId(parseInt(e.target.value));
                }}
                bg={bgColor[colorMode]}
                isDisabled={!provider}
              />
            </InputGroup>
          </FormControl>
          {signerAddress && (
            <Center pl="1rem">
              <Button
                isLoading={loading}
                pl="1rem"
                mt="1rem"
                onClick={() => {
                  wrap();
                }}
              >
                Wrap
              </Button>
            </Center>
          )}
        </form>
        <Center>
          {provider ? (
            <Box mt="1rem">
              <Image py="0.5rem" w="30rem" src={image} />
            </Box>
          ) : (
            <ConnectWallet mt="10rem" setProvider={setProvider} />
          )}
        </Center>
      </Container>
      <Footer />
    </>
  );
}

export default App;
