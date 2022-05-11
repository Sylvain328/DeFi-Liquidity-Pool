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
                    <LiquidityPool requestManager={this.props.requestManager} />
                </div>
            </div>

        )
    }
}