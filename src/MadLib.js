import { useQuery } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BlockContent from '@sanity/block-content-to-react';
import { sanity, imageUrlBuilder } from './sanity';
import styles from './MadLib.module.css';

const query = `
  *[ _type == 'madLib' && slug.current == $slug ]
`;

function MadLib() {
  // this variable is populated from `react-router` which pulls it from the URL
  const { slug } = useParams();

  // data is fetched from sanity via the sanity client and stored into
  // application state via react-query. note that the slug is used as the
  // "query key": https://react-query.tanstack.com/guides/query-keys
  const { data = [] } = useQuery(slug, () => sanity.fetch(query, { slug }));

  // we'll use destructuring assignment to return the first mab lib
  const [madLib] = data;

  // this will store the state of the answers of this mad lib
  const [answers, setAnswers] = useState(
    // if the items exist in localStorage, then
    localStorage.getItem(slug)
      ? // then set the initial state to that value
        JSON.parse(localStorage.getItem(slug))
      : // otherwise, set the initial state to an empty object
        {},
  );

  // this is a react "effect" hook: https://reactjs.org/docs/hooks-effect.html
  // we use this to watch for changes in the `slug` or `answers` variables and
  // update local storage when those change.
  useEffect(() => {
    localStorage.setItem(slug, JSON.stringify(answers));
  }, [slug, answers]);

  if (!madLib) {
    return <h1>Loading…</h1>;
  }

  // once the mad lib is loaded, we can map through the structured content to
  // find our placeholder shape. the end result is an array of these placeholders
  const placeholders = madLib?.story
    .map((block) => block.children.filter((n) => n._type === 'placeholder'))
    .flat();

  // using the above placeholders array, we calculate whether or not all the
  // blanks are filled in by checking the whether every placeholder has a value
  // in the `answers` state variable.
  const allBlanksFilledIn = placeholders?.every(
    (placeholder) => answers[placeholder._key],
  );

  return (
    <>
      <h2 className={styles.title}>{madLib.title}</h2>
      <img
        className={styles.img}
        alt={madLib.title}
        src={imageUrlBuilder.width(425).height(425).image(madLib.image).url()}
      />
      {!allBlanksFilledIn ? (
        // if all the blanks are _not_ filled in, then we can show the form
        <>
          <p>Fill in the blank!</p>
          <p>When you're done, the finished mad lib will appear.</p>
          <form
            // this `onSubmit` will fire when the user clicks the submit button
            onSubmit={(e) => {
              e.preventDefault();

              const answerEntries = Array.from(
                // find all the inputs
                e.currentTarget.querySelectorAll('input'),
              )
                // then get the name and values in a tuple
                .map((inputEl) => [inputEl.name, inputEl.value]);

              // use `Object.fromEntries` to transform them back to an object
              const nextAnswers = Object.fromEntries(answerEntries);

              setAnswers(nextAnswers);
            }}
          >
            <ul className={styles.list}>
              {/* for each placeholder… */}
              {placeholders.map(({ _key, type }) => (
                <li className={styles.placeholder} key={_key}>
                  {/* …render an input an a label. */}
                  <input
                    // the `name` of the input will be the sanity `_key`:
                    // https://www.sanity.io/docs/array-type#why-the-key-92296c6c45ea
                    // this will enables us to match this input value with the
                    // correct placeholder
                    name={_key}
                    className={styles.input}
                    id={_key}
                  />
                  <label className={styles.label} htmlFor={_key}>
                    {type}
                  </label>
                </li>
              ))}
            </ul>
            <button className={styles.button}>Submit!</button>
          </form>
        </>
      ) : (
        // if all the blanks are filled in, then we can show the rendered
        // story with a custom serializer for the type `placeholder`
        <>
          <BlockContent
            className={styles.blockContent}
            blocks={madLib.story}
            serializers={{
              // see here: https://github.com/sanity-io/block-content-to-react
              types: { placeholder: ({ node: { _key } }) => answers[_key] },
            }}
          />

          <button
            className={styles.button}
            onClick={() => {
              // we reset the state on click after the users confirms it's okay.
              if (window.confirm('Are you sure you want to reset?')) {
                setAnswers({});
              }
            }}
          >
            Reset
          </button>

          {/* this is a simple link back to the main mab libs index */}
          <Link className={styles.button} to="/">
            ← More Mad Libs
          </Link>
        </>
      )}
    </>
  );
}

export default MadLib;
