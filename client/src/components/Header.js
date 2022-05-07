import React from 'react';

export default class Header extends React.Component {
    
    constructor(props) {
        super(props);
    }

    render(){
        return(
            <div className="Header">
                <div>
                    <h1>DeFi Pool Liquidity</h1>
                </div>
                <div>
                    <div>{this.props.account}</div>
                    <div className='StatusContainer'>
                        <div className={`OwnerStatus ${this.props.isOwner ? "" : "HideComponent"}`}>owner</div>
                    </div>
                </div>
            </div>
        )
    }
}
