import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Web3 from 'web3'
import HDWalletProvider from 'truffle-hdwallet-provider';


const Contract = require('./contracts/contract.json');

class App extends Component {
  state = {
    web3: '',
    contract: '',
    loading: true,
    account: null,
    balance: 0,
    errorMsg: '',
    name: '',
    email: '',
    phone: '',
    participants: [],
  };

  componentDidMount = async() => {
    try{
      //Connect to web3
      // const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8543"))
      const provider = new HDWalletProvider(
          'plate virtual shallow state apart capital assume wise amount spike blanket piece',
          'https://ropsten.infura.io/v3/4d09162ed14643e7be9400e74b187079'
      );

      this.setState({ web3: new Web3(provider) })

      //Get logged in MetaMask ETH address
      const web3 = new Web3(provider);

      const accounts = await web3.eth.getAccounts(); 
      this.setState({ account: accounts[0] });

      const balance = await web3.eth.getBalance(accounts[0]);
      // console.log(await contract.methods.getOrganizer().call());
      // console.log(await contract.methods.pickWinner().send({
      //   from: accounts[0]
      // }));
      // console.log();
      this.setState({ loading: false, 
        balance: web3.utils.fromWei("" + balance, "ether"), 
        web3: web3, 
        contract: new web3.eth.Contract(Contract.abi, '0x37f14982691f385931a4c87c58e222449733a6f4')});
      
      const participants = await this.state.contract.methods.getParticipants().call();
      this.setState({ participants: participants, winner: await this.state.contract.methods.getWinner().call() });

    } catch(error){

      console.log("Could not connect to web3", error)
      this.setState({ loading: false, errorMsg: "Could not connect to web3. Check console for error logs" })
    }
  };

  componentMounted = () => {
    this.getParticipants();
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Cadastrando...")
    await this.state.contract.methods.registration(this.state.name, this.state.phone, this.state.email).send({
        from: this.state.account,
        value: this.state.web3.utils.toWei("0.01", "ether")
      })
    this.setState({ loading: true})
    this.getParticipants();
  };

  handleChange = (event) => {
    const type = event.target.id;
    this.setState({ [type]: event.target.value });
  };

  pickWinner = async () => {
    console.log("Escolhendo vencedor")
    console.log(await this.state.contract.methods.pickWinner().send({
      from: this.state.account
    }))
    await this.state.contract.methods.pickWinner().send({
      from: this.state.account
    });
    this.setState({ winner: await this.state.contract.methods.getWinner().call() })
    console.log(`Vencedor escolhido: ${this.state.winner} `)
  }

  getParticipants = async () => {
    console.log("Buscando participantes")
    const participants = await this.state.contract.methods.getParticipants().call();
    this.setState({ participants: participants });
  }

  render() {
    const { account, loading, balance, errorMsg, participants, winner } = this.state
    // this.getParticipants();
    return (
      <div className="App">
        <div className="App-intro">

          {(loading)?(
            <p>Loading...</p>
          ):(
            (errorMsg.length > 0)?(
              <p>An error occurred: {errorMsg}</p>
            ):(
            <p>
              Your ETH address is {account}<br />
              Your POLY balance is {balance} POLY
            </p>
            )
            
          )}
          {!winner && 
            <form className="form" onSubmit={(event) => { this.handleSubmit(event) }}>
              <h1>Cadastre uma pessoa</h1>
              <label htmlFor="name" >Nome</label><br />
              <input type="name" id="name" palceholder="Nome" value={this.state.name} onChange={this.handleChange} /><br />
              
              <label htmlFor="email" >E-mail</label><br />
              <input type="email" id="email" palceholder="E-mail" value={this.state.email} onChange={this.handleChange} /><br />
              
              <label htmlFor="name" >Telefone</label><br />
              <input type="number" id="phone" palceholder="Telefone" value={this.state.phone} onChange={this.handleChange} /><br />
              
              <input type="submit"/>
            </form>
          }

          <button onClick={ () => { this.pickWinner() } } >Escolher Vencedor</button><br /><br /><br />
          
          <div>
            <h3>Lista de participantes</h3>
            {participants.map((participant) => (
              <div key={participant}>{ participant }</div>
            ))}
          </div><br /><br /><br />

          <div>
            Vencedor
            <h3>{ this.state.winner }</h3>
          </div>
        </div>
      </div>
    );
  };
}

export default App;
