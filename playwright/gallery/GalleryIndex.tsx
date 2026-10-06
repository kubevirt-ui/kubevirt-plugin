import type { JSX } from 'react';

import { Button, Content, PageSection, Title } from '@patternfly/react-core';

import { storyRoutePath } from './gallery-routes';

type GalleryIndexProps = {
  onSelectStory: (storyId: string) => void;
  storyIds: string[];
};

const GalleryIndex = ({ onSelectStory, storyIds }: GalleryIndexProps): JSX.Element => (
  <PageSection data-test="gallery-index">
    <Title headingLevel="h1" size="2xl">
      Component gallery
    </Title>
    <Content component="p" className="pf-v6-u-mt-md">
      Pick a story to render below, or call{' '}
      <code>await window.mount(&#123; story: &apos;…&apos; &#125;)</code> in the devtools console.
    </Content>
    {storyIds.length === 0 ? (
      <Content component="p" className="pf-v6-u-mt-lg">
        No stories found. Add a <code>*.scene.tsx</code> file under <code>playwright/scenes/</code>.
      </Content>
    ) : (
      <ul className="pf-v6-u-mt-lg">
        {storyIds.map((storyId) => (
          <li key={storyId} className="pf-v6-u-mb-sm">
            <Button
              component="a"
              data-test={`gallery-story-${storyId}`}
              href={storyRoutePath(storyId)}
              onClick={(event) => {
                if (!event.metaKey && !event.ctrlKey && event.button === 0) {
                  event.preventDefault();
                  onSelectStory(storyId);
                }
              }}
              variant="link"
            >
              {storyId}
            </Button>
          </li>
        ))}
      </ul>
    )}
  </PageSection>
);

export default GalleryIndex;
