import React from 'react';
import LiquidityPool from './LiquidityPool.js';

export default class PoolContainer extends React.Component {

    render(){

        return(
            <div className='PoolPart'>
                <div className="flux">Liquidity pools</div>
                <div className='PoolContainer'>
                    {
                        Object.entries(this.props.poolManagers).map(([key,value])=>{
                            return <LiquidityPool key={key} tokenId={key} tokenAddress={value.tokenAddress} requestManager={this.props.requestManager} symbol={value.symbol} />
                        })
                    }
                </div>
            </div>

        )
    }
}