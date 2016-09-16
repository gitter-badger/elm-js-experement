import React from 'react';
import classnames from 'classnames';
import { Viewier } from './mangojuice';
import { Commands } from './Commands';


export const View = new Viewier((model) => (
  <div>
    <ul>
      <HeaderNavigationLink
        title="Home"
        onClick={Commands.HomeRoute}
        active={model.isActive(Commands.HomeRoute)}
      />
      <HeaderNavigationLink
        title="Lessons"
        onClick={Commands.LessonsRoute}
        active={model.isActive(Commands.LessonsRoute)}
      />
    </ul>
    {model.render()}
  </div>
));

export const HeaderNavigationLink = ({ active, title }) => (
  <li>
    <a className={classnames({ active })}>
      {title}
    </a>
  </li>
);
