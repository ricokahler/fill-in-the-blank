import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { sanity, imageUrlBuilder } from './sanity';
import styles from './MadLibList.module.css';

const query = `
  *[ _type == 'madLib' ] { title, image, slug }
`;

function MadLibList() {
  // in this one line, data is fetched from sanity via the sanity client and
  // stored into application state via react-query!
  const { data: madLibs } = useQuery('madLibsList', () => sanity.fetch(query));

  // if we don't have madLibs yet, then the data must be loading
  if (!madLibs) {
    return <h1>Loading…</h1>;
  }

  return (
    <>
      <h1>Mad Libs</h1>

      <ul className={styles.list}>
        {/* loop through all of the mabLib and show them in a list */}
        {madLibs.map(({ title, slug, image }) => (
          <li key={slug.current}>
            {/* ;ink comes from react-router and it powers navigation on the */}
            {/* site. here we use sanity slugs to create unique URLs. */}
            <Link className={styles.tile} to={`/mad-libs/${slug.current}`}>
              <img
                alt={title}
                // use the sanity `imageUrlBuilder` to
                // generate optimized images on the fly
                src={imageUrlBuilder.width(425).height(425).image(image).url()}
                width="425px"
                height="425px"
              />
              <h2 className={styles.tileTitle}>{title}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default MadLibList;
