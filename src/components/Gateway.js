import React, { Component, useEffect, useState, setState, useRef } from "react";
import Web3 from "web3";
import "./App.css";
import DevilTokenAbi from "../remix_abis/DevilToken.json";
import DevilGatewayAbi from "../remix_abis/Gateway.json";
import GatewayTransferAbi from "../remix_abis/GatewayTransfer.json";
import OnramperWidget from "@onramper/widget";
import RwdAbi from "../remix_abis/RWD.json";
import OnramperWidgetContainer from "./Onboarder.js"
import RangeSliderDEVL from "./RangeSlider";
import { useWeb3React } from "@web3-react/core";
import axios from 'axios';

const Gateway = (props) => {

  const [networkId, setNetworkId] = React.useState(undefined);
  const [devilToken, setDevilToken] = React.useState([undefined]);
  const [devilTokenAddress, setDevilTokenAddress] = React.useState("");
  const [rwd, setRwd] = React.useState(undefined);
  const [rwdAddress, setRwdAddress] = React.useState("");
  const [rewardTokenAddress, setRewardTokenAddress] = React.useState("");
  const [devilVault, setDevilVault] = React.useState([undefined]);
  const [devilVaultAddress, setDevilVaultAddress] = React.useState("");
  const [devilGateway, setDevilGateway] = React.useState([undefined]);
  const [devilGatewayAddress, setDevilGatewayAddress] = React.useState("");
  const [gatewayTransfer, setGatewayTransfer] = React.useState([undefined]);
  const [gatewayTransferAddress, setGatewayTransferAddress] = React.useState("");
  const [devilTokenBalance, setDevilTokenBalance] = React.useState("0");
  const [rwdTokenBalance, setRwdTokenBalance] = React.useState("0");
  const [stakingBalance, setStakingBalance] = React.useState("0");
  const [amountStaked, setAmountStaked] = React.useState("0");
  const [lifetimeRewardsGiven, setLifetimeRewardsGiven] = React.useState("0");
  const [globalStakingBalance, setGlobalStakingBalance] = React.useState("0");
  const [pendingUserRewards, setPendingUserRewards] = React.useState("0");
  const [symbol, setSymbol] = React.useState([undefined]);
  const [ethBalance, setEthBalance] = React.useState("0");
  const [data, setData] = React.useState([]);
  const [price, setPrice] = React.useState("");
  
  const [updateState, setUpdateState] = React.useState(false);
  const inputRef = useRef();
  const inputRef2 = useRef();
  const [inputValueTransfer, setInputValueTransfer] = React.useState(0);
  const [inputValueBuy, setInputValueBuy] = React.useState(0);
  const [inputValueSell, setInputValueSell] = React.useState(0);

  const APIKEY = process.env.REACT_APP_API_KEY

  //Web3React
  const { active, account, library, connector, activate, deactivate, web3} = useWeb3React();

  // let newWeb3 = props.web3;
  window.web3 = new Web3(window.ethereum);


  useEffect(() => {
    
      const init = async () => {
        
        const web3 = await window.web3;
        if(account !== undefined){
          const networkId = await web3.eth.net.getId();
          setNetworkId(networkId);
        }

        //LOAD devilToken
        const devilTokenAddress = "0xD280e0Fea29BcAe6ED9DD9fb4B9e5Fa90F5C249D";
        setDevilTokenAddress(devilTokenAddress);
        const devilToken = new web3.eth.Contract(
          DevilTokenAbi,
          devilTokenAddress
        );
        setDevilToken(devilToken);
        console.log(devilToken);

        //LOAD devil gateway
        const devilGatewayAddress = "0x1C781CE11522dCDCc1C082606Eb3c67231624FEd";
        setDevilGatewayAddress(devilGatewayAddress);
        const devilGateway = new web3.eth.Contract(
          DevilGatewayAbi,
          devilGatewayAddress
        );
        setDevilGateway(devilGateway);
        console.log(devilGateway);

        //LOAD devil gateway transfer
        const gatewayTransferAddress = "0x44B8b405051b3cB857dF0e2F1997140f3AFE8764";
        setGatewayTransferAddress(gatewayTransferAddress);
        const gatewayTransfer = new web3.eth.Contract(
          GatewayTransferAbi,
          gatewayTransferAddress
        );
        setGatewayTransfer(gatewayTransfer);
        console.log(gatewayTransfer);

        //Load price through axois query
        axios.get('https://api.coingecko.com/api/v3/coins/binance-smart-chain/contract/0xD280e0Fea29BcAe6ED9DD9fb4B9e5Fa90F5C249D')
        .then(res => {
         setData(res.data);
         console.log(res.data);
         setPrice(res.data.market_data.current_price.usd);
        })

        //Load our staking state and other account data

        if (account !== undefined){
          let devilTokenBalance = await devilToken.methods.balanceOf(account).call();
          setDevilTokenBalance(devilTokenBalance.toString());

          let ethBalance = await web3.eth.getBalance(account);
          setEthBalance(ethBalance);

          //event subscriptions that call update function to sync state variables w/ block chain

          devilGateway.events.DEVLPurchased({fromBlock: 0})
            .on('data', event => update()
          );

          devilGateway.events.DEVLSold({fromBlock: 0})
            .on('data', event => update()
          );

          const updateState = false
          setUpdateState(updateState)
        } 
        
    }
    init();
  }, [account, devilTokenBalance, ethBalance]);
    
  async function update() {
    
    const init = async () => {

      const web3 = window.web3;
      let devilTokenBalance = await devilToken.methods.balanceOf(account).call();
          setDevilTokenBalance(devilTokenBalance.toString());

      let ethBalance = await web3.eth.getBalance(account);
          setEthBalance(ethBalance);

    }
    init();
  }

const buyDevl = (amount) => {
  const web3 = window.web3;
  web3.eth.sendTransaction({
    from: account,
    to: devilGatewayAddress,
    value: amount,
})
}

const sellDevl = (amount) => {
  setUpdateState(true)
  amount = window.web3.utils.toWei(amount, 'Ether')
  devilToken.methods.approve(devilGateway._address, amount).send({from: account}).on('transactionHash', (hash) => {
  devilGateway.methods.sellDevl(amount).send({gasLimit: 10000000, from: account})
  })
}

const transferDevl = (amount, receiver) => {
  setUpdateState(true)
  amount = window.web3.utils.toWei(amount, 'Ether')
  devilToken.methods.approve(devilGateway._address, amount).send({from: account}).on('transactionHash', (hash) => {
  gatewayTransfer.methods.transferDevl(amount, receiver).send({from: account})
  })
}


        return (
            <div> 

                <div class="row row-30 justify-content-left">
                    <div class="col-3">
                        <div>
                            Status: <b>{updateState ? 'loading' : 'complete'}</b>
                        </div>
                    </div>
                    <div class="col-3">

                    </div>
                    <div class="col-3">

                    </div>
                    <div class="col-3">
                    <button class="btn btn-primary btn-sm btn-block" data-modal-trigger='{"target":"#modal-login"}'>BUY CRYPTO</button>
                    </div>
                    
                </div>
                <div class="row row-30 justify-content-center">
                  <div class="h2" style={{ textAlign: 'center' }}>
                  DEVIL'S GATEWAY
                  </div>
                </div>

                <div class="row row-30 justify-content-center">
                    <div class="col-2 justify-content-center">
                        {/* Spacer */}
                    </div>
                    <div class="col-2 justify-content-center">
                        <div>
                          <img class="mt-xxl-4" src="assets/media/DEVIL_logo_red_centered.png" alt="" width="300" height="300" />
                        </div>
                        <div>
                          <p style={{ textAlign: 'center' }}>Balance</p>  
                          <p style={{ textAlign: 'center' }}>{parseFloat(window.web3.utils.fromWei(devilTokenBalance, 'Ether')).toFixed(5)} DEVL</p>
                        </div>
                    </div>
                    <div class="col-4 justify-content-center">
                        <div class="row row-30 justify-content-center">
                          <div class="h4" style={{ textAlign: 'center' }}>
                           PRICE
                          </div>
                        </div>
                        <div class="row row-30 justify-content-center">
                          <div>
                            {/* {/* <p style={{ textAlign: 'center' }}>N/A</p> */}
                            <p style={{ textAlign: 'center' }}>${price} USD</p>
                          </div>
                      </div>
                        <div class="row row-30 justify-content-center">
                          {/* spacer */}
                        </div>
                        <div div class="row row-30 justify-content-center">        
                    </div>
                    </div>
                    
                    <div class="col-2 justify-content-center">
                        <div>
                          <img class="mt-xxl-4"  src="assets/media/bnb_logo_centered.png" alt="" width="300" height="300" />  
                        </div>
                        <div>
                          <p style={{ textAlign: 'center' }}>Balance</p>
                          <p style={{ textAlign: 'center' }}>{parseFloat(window.web3.utils.fromWei(ethBalance, 'Ether')).toFixed(5)} BNB</p>
                        </div>
                    </div>
                    <div class="col-2 justify-content-center">
                        {/* Spacer */}
                    </div>
                </div>
                <div class="row row-30 justify-content-center">
                  <div class="col-2"></div>
                  <div class="col-3 justify-content-center">
                          <form class="block block-sm" data-np-checked="1">
                          <input type="number" value={inputValueBuy} onChange={e => setInputValueBuy(e.target.value)} className="form-control"/>
                              {/* <RangeSliderDEVL
                              ethBalance = {ethBalance}
                              devilTokenBalance = {devilTokenBalance}
                              web3={props.web3}
                              inputRef2={inputRef2}
                            /> */}
                              {/* <p type='submit' onClick={(event) =>{
                                event.preventDefault();
                                let amount
                                amount = inputRef = devilTokenBalance;
                              }}
                              style={{ textAlign: 'right' }}>Max
                              </p> */}

                                <button 
                                  class="link"
                                  onClick={(event) => {
                                  event.preventDefault()
                                  let amount
                                  amount = devilTokenBalance.toString() 
                                  amount = window.web3.utils.fromWei(amount, 'Ether')
                                  setInputValueBuy(amount)
                                  }}
                                  >Max
                                </button>
                                  <button 
                                      type='submit'
                                      onClick={(event) => {
                                      event.preventDefault()
                                      let amount
                                      amount = inputValueBuy
                                      amount = window.web3.utils.toWei(amount, 'Ether')
                                      buyDevl(amount)
                                      }}
                                      className='btn btn-primary btn-lg btn-block'>BUY DEVL
                                  </button>
                                  
                          </form>
                          </div>
                        <div class="col-2"></div>
                        <div class="col-3 justify-content-center">
                        <form class="block block-sm" data-np-checked="1">
                            <input type="number" value={inputValueSell} onChange={e => setInputValueSell(e.target.value)} className="form-control"/>
                                <button 
                                  class="link"
                                  onClick={(event) => {
                                  event.preventDefault()
                                  let amount
                                  amount = devilTokenBalance.toString() 
                                  amount = window.web3.utils.fromWei(amount, 'Ether')
                                  setInputValueSell(amount)
                                  }}
                                  >Max
                                </button>
                            <button 
                                    type='submit'
                                    onClick={(event) => {
                                    event.preventDefault()
                                    let amount
                                    amount = inputValueSell.
                                    // amount = window.web3.utils.toWei(amount, 'Ether')
                                    sellDevl(amount)
                                    }}
                                    className='btn btn-primary btn-lg btn-block'>SELL DEVL
                            </button>
                        </form>             
                        </div>

                    
                    <div class="col-2 justify-content-center">
                        {/* Spacer */}
                    </div>
                    <div class="col-2 justify-content-center">   
                    </div>
                    <div class="col-2 justify-content-center"> 
                    </div>
                    <div class="col-2 justify-content-center">
                        {/* Spacer */}
                    </div>
                </div>

                {/* GATEWAY TRANSFER
                <div class="row row-30 justify-content-center" style={{ textAlign: 'center' }}>
                  <div class="col-4 justify-content-center">
                    <div class="h4" style={{ textAlign: 'center' }}>
                      TRANSFER DEVIL
                    </div>
                    <form class="block block-sm" data-np-checked="1">
                      <p>Receiver Address</p>
                      <input type="string" ref={inputRef2} className="form-control"/>
                      <p>Amount</p>
                      <input type="number" value={inputValueTransfer} onChange={e => setInputValueTransfer(e.target.value)} className="form-control" />
                      <div class="p" style={{ textAlign: 'left' }}>
                        <button 
                          class="link"
                          onClick={(event) => {
                          event.preventDefault()
                          let amount
                          amount = devilTokenBalance.toString() 
                          amount = window.web3.utils.fromWei(amount, 'Ether')
                          setInputValueTransfer(amount)
                          }}
                          >Max
                          </button>
                        </div>
                        <button 
                          type='submit'
                          onClick={(event) => {
                          event.preventDefault()
                          let amount
                          amount = inputValueTransfer
                          // amount = window.web3.utils.toWei(amount, 'Ether')
                          let receiver
                          receiver = inputRef2.current.value.toString();
                          transferDevl(amount, receiver)
                          }}
                          className='btn btn-primary btn-lg btn-block'>TRANSFER DEVL
                        </button>
                    </form>
                  </div>         
                </div> */}

                <div class="row row-30 justify-content-center">   
                
                      <div class="modal fade" id="modal-login" tabindex="-1" role="dialog">
                          <div class="modal-dialog" role="document">
                              <div class="modal-content">
                              {/* <article class="blurb blurb-boxed"> */}
                                <div
                                  style={{
                                    width: "600px",
                                    height: "600px",
                                    boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.1)",
                                    borderRadius: "10px",
                                    margin: "auto",
                                    color: "#000003"
                                  }}
                                >
                                  <OnramperWidget
                                    color= "#000003"
                                    defaultAmount={100}
                                    // defaultAddrs={account}
                                    API_KEY={APIKEY}
                                    filters={{
                                      onlyCryptos: ["BNB_BEP20"]
                                    }}
                                  />
                                </div>
                              {/* </article> */}
                              <button class="close" type="button" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                              </div>
                          </div>
                        </div>

                     
                       {/* <!-- Preloader--> */}
                       </div>



                      <div class="preloader">
                          <div class="preloader-inner">
                              <div class="preloader-dot"></div>
                              <div class="preloader-dot"></div>
                              <div class="preloader-dot"></div>
                              <div class="preloader-dot"></div>
                          </div>
                      </div>
            </div>    
          );
        }
    
//  {/* <!-- Modal: JUST A CODE SAVE FOR TEMPLATE NOT ACTIVE--> */}
//                       {/* <div class="modal fade" id="modal-login" tabindex="-1" role="dialog">
//                           <div class="modal-dialog" role="document">
//                               <div class="modal-content">
//                                   <div class="modal-body text-center">
//                                       <h3>Log In</h3>
//                                       <p>Lorem ipsum dolor sit amet, consectetur adipiscing</p>
//                                       <form class="rd-mailform">
//                                       <div class="form-group">
//                                           <input class="form-control" type="text" name="name" placeholder="Your name *" data-constraints="@Required" />
//                                       </div>
//                                       <div class="form-group">
//                                           <input class="form-control" type="password" name="password" placeholder="Password *" data-constraints="@Required" />
//                                       </div>
//                                       <div class="offset-xxs group-40 d-flex flex-wrap flex-xs-nowrap align-items-center">
//                                           <button class="btn btn-block" type="submit">Log in</button>
//                                       </div>
//                                       </form>
//                                   </div>
//                               <button class="close" type="button" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
//                               </div>
//                           </div>
//                       </div> */}

export default (Gateway);

// {/* //TEST API KEY: pk_test_lQP0Ao0cFm1bEbY2CGrdv3JVzcUSJUlF1D8gF25Mnsw0 */}



 