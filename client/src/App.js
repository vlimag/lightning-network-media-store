import React, { useState, useEffect } from "react";
import {Buffer} from 'buffer';
import './App.css';

const media = [
  {
    name: "BTJetsons (photo)",
    price: 200,
    source: "01.png",
    invoice: "",
    paymentHash: "",
    buyButton: false,
    checkButton: true,
    fileDownloadUrl: ""
  },
  {
    name: "BTCompass (photo)",
    price: 200,
    source: "02.png",
    invoice: "",
    paymentHash: "",
    buyButton: false,
    checkButton: true,
    fileDownloadUrl: ""
  },
  {
    name: "Madayaka (video)",
    price: 1000,
    source: "03.mp4",
    invoice: "",
    paymentHash: "",
    buyButton: false,
    checkButton: true,
    fileDownloadUrl: ""
  }
]

function Media(props){

  const [mediaList, setMedia] = useState(media);
  useEffect(() => {},[props.invoice, props.fileDownloadUrl])

  function generateInvoice(source, price) {
    fetch(`/generate-invoice/${source}/${price}`)
      .then(res => res.json())
      .then(data => {
        const updateMedia = mediaList.map((m) => {
          if (m.source === source) {
            const updatedMedia = {
              ...m,
              invoice: data.payment_request,
              paymentHash: Buffer.from(data.r_hash).toString('hex'),
              buyButton: true,
              checkButton: false
            };
            return updatedMedia;
          }
          return m;
        });
        setMedia(updateMedia);
        }
      )
  }

  function checkInvoice(paymentHash) {
    fetch(`/check-invoice/${paymentHash}`)
      .then(res => res.json())
      .then(data => {
        if (data.settled === true) {
          getContent(data.memo).then(
            (res) => {
              const updateMedia = mediaList.map((m) => {
                if (m.source === data.memo) {
                  return {
                    ...m,
                    invoice: 'THANK YOU',
                    checkButton: true,
                    fileDownloadUrl: res
                  };
                }
                return m;
              });
              setMedia(updateMedia);
            }
          )
        }
        else {
          alert("Payment not yet received")
        }
      })
  }

  async function getContent(source) {
    return await fetch(`/file/${source}`)
      .then(res => res.blob())
      .then(blob => URL.createObjectURL(blob))
  }

  return (
    <div className='media-outter-wrapper'>
    { mediaList.map((m) => {
      return(
        <div key={m.source} className='media-wrapper'>
          <div style={{margin:'auto', width:'80%'}}>
            <p className="asset-title">{m.name}</p>
            <p>Price: {m.price} sats</p>
            <img className='asset-img' src={"assets/" + m.source + ".small.png"} width='285px' height="220px" alt={m.name} />
            <br />
            <button disabled={m.buyButton} style={{padding: '10px', margin: '10px'}} type="button" onClick={ () => { generateInvoice(m.source, m.price) } }>Buy</button>
            <button disabled={m.checkButton} style={{padding: '10px', margin: '10px'}} type="button" onClick={ () => { checkInvoice(m.paymentHash) } }>Check Payment</button>
            <br></br>
            <textarea style={{ resize: "none" }}rows="9" cols="32" value={m.invoice} readOnly></textarea>
            <br></br>
            <a style={{visibility: (!m.checkButton || !m.buyButton) ? "hidden" : "visible" }} href={m.fileDownloadUrl} rel="noreferrer" target="_blank">View</a>
            <br></br>
            <a style={{visibility: (!m.checkButton || !m.buyButton) ? "hidden" : "visible" }} href={m.fileDownloadUrl} rel="noreferrer" target="_blank" download>Download</a>
          </div>
        </div>
      )})
    }
    </div>
  )
}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      alias: ""
    };
  }

  componentDidMount() {
    const getInfo = async () => {
      const response = await fetch('/getinfo');
      const { alias } = await response.json();
      this.setState({
        alias
      });
    };
    getInfo();
  }

  render() {

    return (
      <div>
        <p className="header-p">Welcome to { this.state.alias } store!!</p>
        <Media />
      </div>
    );
  }
}

export default App;