import { Route, Switch, Link } from 'react-router-dom';
import MadLibList from './MadLibList';
import MadLib from './MadLib';
import NotFound from './NotFound';
import styles from './App.module.css';

function App() {
  return (
    <>
      <header className={styles.header}>
        <Link className={styles.headerLink} to="/">
          Sanity Mad Libs
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <Switch>
            <Route component={MadLibList} path="/" exact />
            <Route component={MadLib} path="/mad-libs/:slug" />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </>
  );
}

export default App;
