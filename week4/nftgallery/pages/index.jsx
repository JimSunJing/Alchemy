import { useState } from "react"
import { NFTCard } from "./components/nftCard"

const Home = () => {

  const [wallet, setWalletAddress] = useState('');
  const [collection, setCollectionAddress] = useState('');
  const [NFTs, setNFTs] = useState([]);
  const [fetchForCollection, setFetchForCollection] = useState(false);
  const [pageKey, setPageKey] = useState('');
  const [nextToken, setNextToken] = useState('');

  // fetch nft via Alchemy api
  const fetchNFTs = async () => {
    let nfts;
    console.log("fetching NFTs...");
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API;
    const baseURL = `https://eth-mainnet.g.alchemy.com/nft/v2/${apiKey}/getNFTs`;

    var requestOptions = {
      method: 'GET'
    };

    if (!collection.length) {
      // fetch without filtering collection
      console.log("fetch all of a wallet nft");
      const fetchURL = pageKey === '' ? `${baseURL}?owner=${wallet}`
        : `${baseURL}?owner=${wallet}&pageKey=${pageKey}`;
      nfts = await fetch(fetchURL, requestOptions).then(data => data.json());
    } else {
      console.log("filter with collection");
      const fetchURL = pageKey === '' ? `${baseURL}?owner=${wallet}&contractAddresses%5B%5D=${collection}`
        : `${baseURL}?owner=${wallet}&contractAddresses%5B%5D=${collection}&pageKey=${pageKey}`;
      nfts = await fetch(fetchURL, requestOptions).then(data => data.json());

    }
    if (nfts) {
      console.log('nfts:', nfts);
      if (nfts.pageKey) {
        setPageKey(nfts.pageKey);
      } else setPageKey('');
      console.log("pageKey:", pageKey);
      setNFTs(nfts.ownedNfts);
    }
  }

  const fetchNFTsFromCollection = async () => {
    if (collection.length) {
      console.log("start fetching from collection");
      const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API;
      const baseURL = `https://eth-mainnet.g.alchemy.com/nft/v2/${apiKey}/getNFTsForCollection`;
      var requestOptions = {
        method: 'GET'
      };
      const fetchURL = nextToken === '' ? `${baseURL}?contractAddress=${collection}&withMetadata=${"true"}`
        : `${baseURL}?contractAddress=${collection}&withMetadata=${"true"}&startToken=${nextToken}`;
      const nfts = await fetch(fetchURL, requestOptions).then(data => data.json());
      if (nfts) {
        console.log("collection nfts", nfts);
        if (nfts.nextToken) {
          setNextToken(nfts.nextToken);
        } else setNextToken('');
        console.log("nextToken:", nextToken);
        setNFTs(nfts.nfts);
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-y-3">
      <div className="flex flex-col w-full justify-center items-center gap-y-2">
        <input onChange={(e) => { setWalletAddress(e.target.value) }}
          value={wallet} disabled={fetchForCollection}
          type={"text"} placeholder="Add your wallet address"></input>
        <input onChange={(e) => { setCollectionAddress(e.target.value) }}
          value={collection}
          type={"text"} placeholder="Add the collection address"></input>
        <label className="text-gray-600 ">
          <input type={"checkbox"} className="mr-2"
            onChange={(e) => { setFetchForCollection(e.target.checked) }}></input>
          Fetch for collection
        </label>
        <button className={"disabled:bg-slate-500 text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm w-1/5"}
          onClick={() => {
            // setPageKey('');
            // console.log("pageKey before request:", pageKey);
            if (fetchForCollection) {
              fetchNFTsFromCollection();
            } else fetchNFTs()
          }}
        >Let's go! </button>
        <div className='flex flex-wrap gap-y-12 mt-4 w-5/6 gap-x-2 justify-center'>
          {NFTs.length && NFTs.map(nft => {
            return (
              <NFTCard nft={nft} id={nft.id.tokenId} />
            )
          })}
        </div>
        <button className={"disabled:bg-slate-500 text-white bg-green-400 px-4 py-2 mt-3 rounded-sm w-1/5"}
          disabled={(!pageKey || pageKey.length === 0) && (!nextToken || nextToken.length === 0)}
          onClick={() => {
            if (fetchForCollection) {
              fetchNFTsFromCollection();
            } else fetchNFTs()
          }}
        >
          Next Page ➡️
        </button>
      </div>
    </div>
  )
}

export default Home
