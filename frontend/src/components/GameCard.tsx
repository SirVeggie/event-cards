import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GameInfo } from 'shared';
import { useNotification } from '../hooks/useNotification';
import { useRefresh } from '../hooks/useRefresh';
import { RootState } from '../store';
import { titleShade } from '../tools/cssConst';
import { removeGame } from '../tools/database';
import { Button } from './Button';
import { ConfirmationModal } from './ConfirmationModal';
import { Toggle } from './Toggle';
import cx from 'classnames';

type Props = {
  game: GameInfo;
  noButtons?: boolean;
};

export function GameCard(p: Props) {
  const s = useStyles(p);
  const navigate = useNavigate();
  const notify = useNotification();
  const refresh = useRefresh();
  const [modal, setModal] = useState(false);
  const cards = useSelector((state: RootState) => state.cards)
    .filter(card => card.game === p.game.name);

  const types = Array.from(new Set(cards.map(x => x.type)));
  const amountByTypes = types.map(type => ({
    type: type,
    amount: cards.filter(x => x.type === type).length
  }));

  const click = () => {
    if (p.noButtons) return;
    navigate(`/${p.game.name}/cards`);
  };

  const play = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/${p.game.name}`);
  };

  const newCards = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/${p.game.name}/new`);
  };
  
  const generate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/${p.game.name}/generate`);
  };

  const deleteGame = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setModal(true);
  };

  const confirmDelete = (confirm: boolean) => {
    setModal(false);
    if (!confirm) return;

    removeGame(p.game.name).then(() => {
      notify.create('success', 'Game was removed');
      refresh();
    }).catch(err => {
      notify.create('error', err.error);
    });
  };

  return (
    <div className={cx(s.back, s.values)}>
      <div className={s.card}>
        <ConfirmationModal warning yesNo
          title='Delete game'
          text='Are you sure you want to delete this game?'
          open={modal}
          onInput={confirmDelete}
        >
          <GameCard {...p} noButtons />
        </ConfirmationModal>

        <h1 onClick={click}>{p.game.name}</h1>
        <div className={s.stats}>
          <span>Total cards: {cards.length}</span>
          {amountByTypes.map(x => <span key={x.type}>{x.type}: {x.amount}</span>)}
        </div>
        <Toggle on={!p.noButtons}>
          <div className={s.buttons}>
            <Button text='Play' onClick={play} disabled={cards.length < 5} />
            <Button text='Add Cards' onClick={newCards} />
            <Button text='Generate' onClick={generate} />
            <Button text='Delete' onClick={deleteGame} className={s.delete} />
          </div>
        </Toggle>
      </div>
    </div>
  );
}

const useStyles = createUseStyles({
  values: (p: Props) => ({
    '--color': p.game.color,
    '--shade': titleShade(p.game.color),
    '--pointer': p.noButtons ? 'initial' : 'pointer'
  }),
  
  back: {
    backdropFilter: 'blur(5px) brightness(2)',
    boxShadow: '0px 4px 10px var(--color)55',
    borderRadius: '10px',
    overflow: 'hidden',
    minWidth: '250px',
    flexGrow: 1,
  },

  card: {
    opacity: 0.75,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    flexGrow: 1,

    '& > h1': {
      margin: 0,
      padding: '10px 15px',
      cursor: 'var(--pointer)',
      background: 'var(--shade)',
      filter: 'saturate(2)',
    }
  },

  stats: {
    padding: '10px',

    '& > span': {
      marginRight: '10px',
    },
  },

  buttons: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: '10px',
    gap: '10px',

    '& > button': {

    }
  },

  delete: {
    color: '#fff',
    backgroundColor: '#c94747',
    boxShadow: '0px 1px 1px #522a',
    borderColor: '#d33',
  }
});