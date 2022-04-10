import React, { useEffect, useState } from 'react'
import { useAddress, useDisconnect, useMetamask, useNFTDrop } from "@thirdweb-dev/react";
import { GetServerSideProps } from 'next';
import { sanityClient, urlFor } from '../../sanity';
import { Collection } from '../../typings';
import Link from 'next/link';
import { BigNumber } from 'ethers';
import toast, { Toaster } from 'react-hot-toast'

interface Props {
    collection: Collection
}

const NftDropPage = ({collection}: Props) => {

    const [claimedSupply, setClaimedSupply] = useState<number>(0)
    const [totalSupply, setTotalSupply] = useState<BigNumber>()
    const nftDrop = useNFTDrop(collection.address)
    const [loading, setLoading] = useState<boolean>(true)
    const [priceInEth, setPriceInEth] = useState<string>();


    const connectWithMetamask = useMetamask()
    const address = useAddress()
    const disconnect = useDisconnect()
    console.log('collection===> ', collection)

    useEffect(()=> {
        if (!nftDrop) {return}
        const fetchNftDropData = async () => {
            setLoading(true)
            const claimed = await nftDrop.getAllClaimed();
            const total = await nftDrop.totalSupply();

            setClaimedSupply(claimed.length)
            setTotalSupply(total)

            setLoading(false)
        }

        const fetchPrice = async () => {
            const claimConditions = await nftDrop.claimConditions.getAll();

            setPriceInEth(claimConditions?.[0].currencyMetadata.displayValue)
        }

        fetchNftDropData()
        fetchPrice()
    }, [nftDrop])

    const mintNft = () => {
        if (!nftDrop || !address) return;
        const quantity = 2;
        setLoading(true)
        const notification = toast.loading('Minting...', {
            style:{
                background: 'white',
                color: 'green',
                fontWeight: 'bolder',
                fontSize: '17px',
                padding: '20px'
            },
        })
        nftDrop.claimTo(address, quantity)
            .then(async(tx)=> {
                const receipt = tx[0].receipt
                const claimedTokenId = tx[0].id    // the id of the nft claimed
                const claimedNft = await tx[0].data()    // optional! get the claimed nft meta data

                toast('Hooray!!!, You successfully Minted!', {
                    duration: 5000,
                    style: {
                        background: 'green',
                        color: 'white',
                        fontWeight: 'bolder',
                        fontSize: '17px',
                        padding: '20px'
                    }
                })
                setLoading(false)
            })
            .catch((err) => {
                console.log(err)
                toast('Woops!!!, Something went wrong!', {
                    duration: 5000,
                    style: {
                        background: 'red',
                        color: 'white',
                        fontWeight: 'bolder',
                        fontSize: '17px',
                        padding: '20px'
                    }
                })
            })
            .finally(()=> {
                setLoading(false)
                toast.dismiss(notification)
            })

    }

  return (
    <div className="flex h-screen flex-col lg:grid lg:grid-cols-10">
        <Toaster position="bottom-center"/>


        {/* Left Side */}
        <div className="bg-gradient-to-br from-cyan-400 to-rose-500 lg:col-span-4">
            <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
                <div className="bg-gradient-to-br from-yellow-400 to-purple-700 p-2 rounded-xl">
                    <img className="w-44 rounded-xl object-cover lg:h-96 lg:w-72"
                    src={urlFor(collection.previewImage).url()} alt="nft-preview" />
                </div>

                <div className="text-center p-5 space-y-2">
                    <h1 className="font-bold text-white text-4xl">PapaFam NFT Challenge</h1>
                    <h2 className="text-gray-100 text-xl">A collection of awesome NFTs that live and breath react.</h2>
                </div>
            </div>
            
        </div>

        {/* Right Side */}
        <div className="flex flex-1 flex-col p-12 lg:col-span-6">
            {/* Header */}
            <header className="flex items-center justify-between">
                <Link href={'/'}>
                    <h1 className="w-82 cursor-pointer text-xl font-extralight sm:w-30">
                        The <span className="font-extrabold underline decoration-pink-400"> PAPAFAM</span> NFT Market place
                    </h1>
                </Link>

                <button onClick={() => (address? disconnect(): connectWithMetamask())}
                className="rounded-full text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold lg:px-6 lg:py-3 lg:text-base">
                    {address? 'Sign out': 'Sign in'}
                </button>
            </header>

            <hr className="my-2 border" />

            {address &&
                <p className="text-center text-small text-rose-400">Your logged in with your wallet {address.substring(0, 5)}...{address.substring(address.length-5)}</p>
            }

            {/* content */}
            <div className="pt-10 flex flex-1 flex-col items-center text-center lg:space-y-0 lg:justify-center">
                <p className="text-2xl">
                    Discover the <span className="text--3xl font-bold">largest NFT Marketplace</span> | <span className="text--3xl font-bold">{collection.nftCollectionName}</span>
                </p>

                <div className="px-20 flex flex-1 flex-col items-center justify-between w-full lg:flex-row">
                        <div 
                            style={{ backgroundImage: `url(/images/erec.png)`,borderRadius: '10px',backgroundSize: 'cover', backgroundRepeat: 'no-repeat', height: '15rem'}}
                            className="m-2 w-full rounded-xl cursor-pointer">
                            <div className="flex flex-1 flex-col justify-center items-center text-2xl hover:font-bold hover:bg-gradient-to-r from-gray-700 to-gray-700 rounded-xl h-full w-full hover:opacity-50 hover:drop-shadow-2xl">
                                <p className="text-white text-center">{collection.title}</p>
                            </div>
                        </div>
                        <div 
                            style={{ backgroundImage: `url(/images/erec.png)`,borderRadius: '10px',backgroundSize: 'cover', backgroundRepeat: 'no-repeat', height: '15rem'}}
                            className="m-2 w-full rounded-xl cursor-pointer">
                            <div className="flex flex-1 flex-col justify-center items-center text-2xl hover:font-bold hover:bg-gradient-to-r from-gray-700 to-gray-700 rounded-xl h-full w-full hover:opacity-50 hover:drop-shadow-2xl">
                                <p className="text-white text-center">NFT Name</p>
                            </div>
                        </div>
                        <div 
                            style={{ backgroundImage: `url(/images/erec.png)`,borderRadius: '10px',backgroundSize: 'cover', backgroundRepeat: 'no-repeat', height: '15rem'}}
                            className="m-2 w-full rounded-xl cursor-pointer">
                            <div className="flex flex-1 flex-col justify-center items-center text-2xl hover:font-bold hover:bg-gradient-to-r from-gray-700 to-gray-700 rounded-xl h-full w-full hover:opacity-50 hover:drop-shadow-2xl">
                                <p className="text-white text-center">NFT Name</p>
                            </div>
                        </div>

                </div>
                <img className="w-80 object-cover pb-10 lg:h-40" src={urlFor(collection.mainImage).url()} alt="apes-nft" />

                <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold">{collection.title}</h1>

                {loading? (
                        <p className="text-green-300 text-xl pt-2 animate-pulse ">Loading...</p>
                    ): (
                        <p className="text-green-300 text-xl pt-2 ">{claimedSupply}/ {totalSupply?.toString()} NFT's closed</p>
                    )
                }

                {loading && (
                    <img className="h-30 w-80" src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif" alt="loading gif" />
                )}

            </div>

            {/* button */}
            <button 
                onClick={mintNft}
                disabled={loading || !address || claimedSupply == totalSupply?.toNumber() } 
                className="mt-10 h-16 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold disabled:bg-gray-400">
                {loading ? (
                    <>Loading</>
                ): claimedSupply === totalSupply?.toNumber() ? (
                    <>Sold Out</>
                ): !address ? (
                    <>Sign in to Mint</>
                ): (
                    <span className='font-bold'>Mint NFT ({priceInEth} ETH)</span>
                ) }
            </button>
        </div>
    </div>
  )
}

export default NftDropPage

export const getServerSideProps: GetServerSideProps = async ({params}) => {
    const query = `
    *[_type == 'collection' && slug.current == $id][0]{
      _id,
      title,
      description,
      address,
      nftCollectionName,
      slug{
        current
      },
      creator->{
        _id,
        name,
        address,
        slug{
          current
        }
      },
      mainImage {
        asset
      },
      previewImage{
        asset
      },
      publishedAt
    }
  `

  const collection = await sanityClient.fetch(query, {
      id: params?.id
  })

  if (!collection) {
      return {
          notFound: true
        }
  }

  return {
      props: {
          collection
      }
  }
}