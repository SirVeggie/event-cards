import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { CardType, ErrorEvent, ERROR_EVENT, GameEvent, LOBBY_EVENT, PLAYER_EVENT, PublicSession, SESSION_EVENT, SyncEvent, SYNC_EVENT } from 'shared';
import { RootState } from '../store';
import { useNotification } from './useNotification';
import { usePlayer } from './usePlayer';
import { useSessionComms } from './useSessionComms';

export function useSession() {
  const sessionName = decodeURIComponent(useParams().session ?? '');
  const isValid = useSelector((state: RootState) => state.sessions.find(x => x.name === sessionName)) !== undefined;
  const player = usePlayer();
  const [session, setSession] = useState<PublicSession | undefined>();
  const notify = useNotification();

  const ws = useSessionComms(sessionName, player, event => {
    if (event.type === LOBBY_EVENT)
      return;
    if (event.type === ERROR_EVENT)
      return handleError(event);
    if (event.type === SYNC_EVENT)
      return handleSync(event);
    handleEvent(event);
  });

  const leave = () => {
    notify.create('info', 'Leaving session');
    ws.send({ type: SESSION_EVENT, action: 'leave', session: sessionName, player });
  };

  const draw = () => {
    ws.send({ type: PLAYER_EVENT, action: 'draw', player, session: sessionName });
  };

  const discard = (card: CardType) => {
    ws.send({ type: PLAYER_EVENT, action: 'discard', player, session: sessionName, card });
  };

  const play = (card: CardType) => {
    ws.send({ type: PLAYER_EVENT, action: 'play', player, session: sessionName, card });
  };

  const give = (card: CardType, target: string) => {
    ws.send({ type: PLAYER_EVENT, action: 'give', player, target, session: sessionName, card });
  };

  // color: 'var(--color)',
  return { session, leave, draw, discard, play, give, isValid, isHost: session?.host === player };

  // Child components

  function handleError(event: ErrorEvent) {
    notify.create('error', event.message);
  }

  function handleSync(event: SyncEvent) {
    setSession(event.session);
  }

  function handleEvent(event: GameEvent) {
    if (event.action === 'join') {
      notify.create('info', `${event.player} joined`);

    } else if (event.action === 'leave') {
      notify.create('info', `${event.player} left`);

    } else if (event.action === 'draw') {
      notify.create('info', `${event.player} drew a card`);

    } else if (event.action === 'discard') {
      notify.create('info', `${event.player} discarded a card`);

    } else if (event.action === 'play') {
      notify.create('info', `${event.player} played ${event.card!.title}`);

    } else if (event.action === 'give') {
      notify.create('info', `${event.player} gave a card to ${event.target}`);
    }
  }
}
