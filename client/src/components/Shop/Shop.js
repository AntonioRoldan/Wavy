import React from 'react'
import PacksGrid from './PacksGrid'
import './Style/Shop.css'
const Shop = () => {
  return (
    <div className='container mt-5'>
      <div className='row'>
        <div className='col-3 filtering-section'>
          <h2 className='filter-header'>Filter results</h2>
        </div>
        <div className='col-9 packs-grid'>
          <h2 className='gallery-header'>Find instrumental packages to buy</h2>
          <PacksGrid />
        </div>
      </div>
    </div>
  )
}

export default Shop
