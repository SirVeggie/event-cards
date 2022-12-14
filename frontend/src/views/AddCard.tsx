import { createUseStyles } from 'react-jss';
import { useNavigate } from 'react-router-dom';
import { Background } from '../components/Background';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Container } from '../components/Container';
import { FormBase } from '../components/FormBase';
import { HeaderStrip } from '../components/HeaderStrip';
import { useGame } from '../hooks/useGame';
import { useInput } from '../hooks/useInput';
import { useNotification } from '../hooks/useNotification';
import { useRefresh } from '../hooks/useRefresh';
import { useSelect } from '../hooks/useSelect';
import { addCard } from '../tools/database';
import { NotFound } from './NotFound';

export function AddCard() {
  const s = useStyles();
  const navigate = useNavigate();
  const refresh = useRefresh();
  const [game] = useGame();

  const [titleField, title] = useInput('Title');
  const [descriptionField, description] = useInput('Description', 'textarea');
  const [typeField, type] = useSelect('Category', game?.types ?? ['(Empty)']);
  const notify = useNotification();

  if (!game)
    return <NotFound />;

  const submit = (e: any) => {
    e.preventDefault();
    addCard({ title, description, type, game: game?.name }).then(() => {
      notify.create('success', 'Card added successfully');
      titleField.reset();
      descriptionField.reset();
      typeField.reset();
    }).catch(err => {
      notify.create('error', err.error);
    });
  };

  const back = () => {
    refresh();
    navigate('/');
  };

  return (
    <Container className={s.container}>
      <Background bg={game.background} />

      <HeaderStrip title={game?.name}>
        <Button text='Back' onClick={back} />
      </HeaderStrip>

      <div className={s.layout}>
        <FormBase glass onSubmit={submit} className={s.form}>
          {titleField}
          {descriptionField}
          {typeField}
          <Button className={s.button} text='Create' />
        </FormBase>

        <div>
          <Card card={{ title, description, type, game: game.name }} />
        </div>
      </div>
    </Container>
  );
}

const useStyles = createUseStyles({
  container: {
    paddingBottom: 20,
  },
  
  form: {
    position: 'relative',
    zIndex: 1,
  },

  layout: {
    display: 'flex',
    flexWrap: 'wrap',

    '& > :first-child': {
      marginRight: '20px',
      marginBottom: '20px'
    }
  },

  button: {
    maxWidth: '100px',
  }
});