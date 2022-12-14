import React from 'react';
import { createUseStyles } from 'react-jss';
import { useGame } from '../hooks/useGame';
import { contMaxWidth, titleShade } from '../tools/cssConst';
import cx from 'classnames';

type Props = {
  title: string;
  children?: React.ReactNode;
};

export function HeaderStrip(p: Props) {
  const [game] = useGame();
  const s = useStyles(game?.color ?? '#fff0');

  return (
    <header className={cx(s.header, s.values)}>
      <h1>{p.title}</h1>
      <div className={s.inner}>
        {p.children}
      </div>
    </header>
  );
}

const useStyles = createUseStyles({
  values: (color: string) => ({
    '--shade': titleShade(color, '#0002'),
  }),
  
  header: {
    background: 'var(--shade)',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '10px',
    marginBottom: 20,
    marginTop: 50,
    transition: 'margin 0.2s ease',
    backdropFilter: 'blur(3.5px)',
    flexWrap: 'wrap',
    
    '& :first-child': {
      flexGrow: 10000,
    },
    
    [`@media (max-width: ${contMaxWidth})`]: {
      marginTop: 20,
    },
    
    '& > h1': {
      margin: 0,
    },
    
  },
  
  inner: {
    flexGrow: 1,
    // width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    // backgroundColor: '#fff',
    
    '& > button': {
      flex: '10000 0 1px',
    }
  },
});