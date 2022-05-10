import React from 'react';
import RateConverter from "../utils/rateConverter.js";
import LiquidityPool from './LiquidityPool.js';

export default class PoolContainer extends React.Component {

    constructor(props) {
        super(props);
    }
    
    componentDidMount = async () => {
    }

    render(){
        return(
            <div className='PoolPart'>
                <div className="flux">Liquidity pools</div>
                <div className='PoolContainer'>
                    <LiquidityPool contract={this.props.contract} tokenContract={this.props.tokenContract} />
                </div>
            </div>

        )
    }
}