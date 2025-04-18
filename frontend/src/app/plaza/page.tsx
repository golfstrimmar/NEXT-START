
'use client';
import React , { useState, useEffect } from 'react';
import styles from './Plaza.module.scss';
// =================================

// =================================
const Plaza: React.FC<PlazaProps> = ({ handlerburgerClick, isOpen }) => {
 
  // ==============================
  // ==============================
  return (
    <div className="plaza">
        <div className={`${styles.burger} ${isOpen ? styles.run : ''}`}
      onClick={() => {
        handlerburgerClick();
      }}>
            <div className="plaza-"></div>
            <div className="plaza-"></div>
            <div className="plaza-"></div>
        </div>
    </div>
  );
};

export default Plaza;
  