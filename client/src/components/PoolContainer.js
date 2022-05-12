import React from 'react';
import LiquidityPool from './LiquidityPool.js';

export default class PoolContainer extends React.Component {

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