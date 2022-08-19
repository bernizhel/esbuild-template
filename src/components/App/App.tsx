/// <reference path="../../typings/images.d.ts" />
/// <reference path="../../typings/styles.d.ts" />

import React, { useState } from 'react';
import './App.css';
import esbuildImage from './esbuild.png';

export const App = () => {
  const [counter, setCounter] = useState<number>(0);

  const onButtonClick = () => {
    throw new Error();
  };

  return (
    <main className={'main'}>
      <p className={'main__counter'}>{counter}</p>
      <div className={'main__counter-buttons'}>
        <button
          className={'main__button'}
          onClick={() => setCounter((prev) => prev + 1)}>
          +
        </button>
        <button
          className={'main__button'}
          onClick={() => setCounter((prev) => prev - 1)}>
          -
        </button>
      </div>
      {/* This button is used to test maps feature of the esbuild */}
      <button
        className={'main__button main__button_error'}
        onClick={onButtonClick}>
        Error
      </button>
      <img src={esbuildImage} alt='ESBuild logo' className={'main__logo'} />
    </main>
  );
};
