import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useNavigate } from 'react-router-dom';
import { CardType } from 'shared';
import { Background } from '../components/Background';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Container } from '../components/Container';
import { HeaderStrip } from '../components/HeaderStrip';
import { Toggle } from '../components/Toggle';
import { useGame } from '../hooks/useGame';
import { usePlayer } from '../hooks/usePlayer';
import { useSession } from '../hooks/useSession';
import { NotFound } from './NotFound';
import cx from 'classnames';
import { useSelect } from '../hooks/useSelect';

export function AdvancedGame() {
  const s = useStyles();
  const [game] = useGame();
  const player = usePlayer();
  const { session, ...other } = useSession();
  const [modal, setModal] = useState(false);
  const [giveModal, setGiveModal] = useState(false);
  const [targetPlayerField, targetPlayer] = useSelect('Target player', session?.players ?? ['(Empty)']);
  const [giveCard, setGiveCard] = useState<CardType | undefined>(undefined);
  const navigate = useNavigate();

  console.log(session);
  if (!other.isValid) return <NotFound />;
  if (!game.background || !session) return <div />;

  const onConfirm = (input: boolean) => {
    setModal(false);
    if (!input) return;

    other.leave();
    navigate(`/${encodeURIComponent(game?.name ?? '')}`);
  };

  const onGive = (input: boolean) => {
    setGiveModal(false);
    if (!input || !giveCard) return;

    other.give(giveCard, targetPlayer);
  };

  return (
    <Container className={s.page}>
      <Background bg={game.background} />
      <HeaderStrip title={`${session?.name} - ${player}` ?? 'Session'}>
        <Button text='Leave' onClick={() => setModal(true)} />
      </HeaderStrip>

      <Players players={session.players} />
      <SideButtons />
      <PlayedCards history={session?.playHistory} />
      <Hand cards={session.me!.hand} />

      <ConfirmationModal yesNo
        title='Leave game?'
        text='You will lose all of your cards?'
        open={modal}
        onInput={onConfirm}
      />
      <ConfirmationModal yesNo
        title='Give card to another player?'
        open={giveModal}
        onInput={onGive}>
        {targetPlayerField}
      </ConfirmationModal>
    </Container>
  );

  // function AllDraw() {
  //   const s = useStyles();

  //   return (
  //     <div className={cx(s.draw, 'allDraw')} onClick={other.allDraw} />
  //   );
  // }

  function SideButtons() {
    const s = useStyles();

    return (
      <>
        {/* <div className={cx(s.history, 'history')} onClick={() => { }} /> */}
        <div className={cx(s.draw, 'draw')} onClick={other.draw} />
      </>
    );
  }

  function PlayedCards(p: { history?: { player: string, card: CardType; }[]; }) {
    const s = useStyles();
    const reversed = [...p.history ?? []].reverse();

    return (
      <Toggle on={!!reversed.length}>
        <div className={s.playedCards}>
          {reversed.map(x => <div key={x.card.title}>
            <div className={s.recentPlayer}>By {x.player}</div>
            <Card card={x.card} />
          </div>)}
        </div>
      </Toggle>
    );
  }

  function Hand(p: { cards: CardType[]; }) {
    const s = useStyles();

    const onGiveClick = (card: CardType) => {
      setGiveCard(card);
      setGiveModal(true);
    };

    return (
      <div className={s.hand}>
        <span>My cards</span>
        <div>
          {p.cards.map(card => <Card key={card.title} card={card}>
            <div className={s.card}>
              <Button text='Play' onClick={() => other.play(card)} />
              <Button text='Give' onClick={() => onGiveClick(card)} />
              <Button text='Discard' onClick={() => other.discard(card)} />
            </div>
          </Card>)}
        </div>
      </div>
    );
  }

  function Players(p: { players: string[]; }) {
    const s = useStyles();

    return (
      <div className={s.players}>
        {p.players.map(player => <div className={s.player} key={player}>{player}</div>)}
      </div>
    );
  }
}

const useStyles = createUseStyles({
  page: {
    position: 'relative',
    padding: '0 20px',
  },

  draw: {
    zIndex: 1,
    position: 'fixed',
    background: '#fff5',
    backdropFilter: 'blur(10px)',
    borderRadius: '10px 0 0 10px',
    border: '1px solid #fff5',
    borderWidth: '1px 0 1px 1px',
    right: 0,
    bottom: '20%',
    height: 100,
    width: 100,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',

    '&:hover': {
      backgroundColor: '#aaa5',
    },

    '&::after': {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff4',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      fontFamily: '"Font Awesome 5 Free"',
      fontWeight: 900,
      fontSize: 60,
    },

    '&.draw::after': {
      content: '"\\e05c"',
    },

    '&.allDraw::after': {
      content: '"\\e05c"',
    }
  },

  history: {
    zIndex: 1,
    position: 'fixed',
    background: '#fff5',
    backdropFilter: 'blur(10px)',
    borderRadius: '10px 0 0 10px',
    border: '1px solid #fff5',
    borderWidth: '1px 0 1px 1px',
    right: 0,
    bottom: '35%',
    height: 100,
    width: 100,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',

    '&:hover': {
      backgroundColor: '#aaa5',
    },

    '&::after': {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff4',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      fontFamily: '"Font Awesome 5 Free"',
      fontWeight: 900,
      fontSize: 60,
    },

    '&.history::after': {
      content: '"\\f1da"',
    },
  },

  allcards: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
  },

  hand: {
    padding: '10px 30px 30px 25px',
    backdropFilter: 'blur(20px) contrast(90%)',
    backgroundColor: '#0002',
    border: '1px solid #6664',
    borderRadius: 20,
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',

    '& > span': {
      display: 'block',
      fontSize: 40,
      color: '#fffa',
      marginBottom: 10,
    },

    '& > div': {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: '10px',
      justifyContent: 'center',
    },
  },

  card: {
    display: 'flex',
    justifyContent: 'space-between',

    '& > button': {

    },
  },

  playedCards: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    marginBottom: 50,
    padding: 30,
    overflowX: 'auto',
    
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    
    '& > div': {
      marginRight: 20,
    }
  },

  recentPlayer: {
    borderRadius: '10px 10px 0 0',
    textAlign: 'center',
    display: 'inline-block',
    backgroundColor: '#fff1',
    backdropFilter: 'blur(10px) contrast(50%)',
    fontSize: '1em',
    padding: '5px 10px',
    position: 'relative',
    left: 10,
    minWidth: 100
  },

  players: {
    position: 'relative',

    '& :first-child': {
      borderBottomLeftRadius: '10px',
    },

    '& :last-child': {
      borderBottomRightRadius: '10px',
    },
  },

  player: {
    textAlign: 'center',
    color: '#fffa',
    display: 'inline-block',
    backgroundColor: '#0005',
    backdropFilter: 'blur(10px) contrast(50%)',
    fontSize: '1.5em',
    padding: '5px 10px',
    position: 'relative',
    top: -20,
    left: 20,
    minWidth: 50
  },
});