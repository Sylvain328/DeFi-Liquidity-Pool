import React from 'react';

export default class Header extends React.Component {
    state={price:0}
    constructor(props) {
        super(props);
    }
    componentDidMount = async () => {
        debugger;
        const price= await this.props.getPrice();
        this.setState({price:price.hwtUsdValue});
    }
    render(){
        return(
            <div className="Header">
                <div>
                    <h1>DeFi Pool Liquidity</h1>
                </div>
                <div>
                    <div>{this.props.account}</div>
                    <div> {this.state.price} </div>
                    <div className={`OwnerStatus ${this.props.isOwner ? "" : "HideComponent"}`}>owner</div>
                    
                </div>
            </div>
        )
    }
}
