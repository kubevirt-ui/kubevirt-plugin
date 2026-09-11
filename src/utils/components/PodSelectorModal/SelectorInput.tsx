import {
  type ChangeEvent,
  type FC,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import TagsInput from 'react-tagsinput';
import classNames from 'classnames';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Label as PfLabel } from '@patternfly/react-core';

import { cleanSelectorStr, cleanTags, isTagValid } from './selectorUtils';

type RenderTagProps = {
  getTagDisplayValue: (tagValue: string) => string;
  key: number;
  onRemove: (tagKey: number) => void;
  tag: string;
};

type SelectorInputProps = {
  autoFocus?: boolean;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  labelClassName?: string;
  onChange: (tags: string[]) => void;
  options?: { basic?: boolean };
  placeholder?: string;
  tags: string[];
};

const SelectorInput: FC<SelectorInputProps> = ({
  autoFocus,
  inputProps,
  labelClassName,
  onChange,
  options = {},
  placeholder,
  tags: initialTags,
}) => {
  const isBasic = !!options.basic;
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>(initialTags);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialTags.every((tag, index) => tag === tags[index])) {
      setTags(initialTags);
    }
  }, [initialTags, tags]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleChange = (newTagsInput: string[], changed: string[]): void => {
    const newTag = changed?.[0];

    if (!isTagValid(newTag, isBasic)) {
      return;
    }

    const cleanNewTag = cleanSelectorStr(newTag);

    if (newTagsInput.filter((tag) => tag === cleanNewTag)?.length > 1) {
      return;
    }

    const newTags = cleanTags(newTagsInput);
    setInputValue('');
    setTags(newTags);
    onChange(newTags);
  };

  const inputPropsWithDefaults = {
    autoFocus,
    className: classNames('input', { 'invalid-tag': !isTagValid(inputValue, isBasic) }),
    'data-test': 'tags-input',
    id: 'tags-input',
    onChange: handleInputChange,
    placeholder: isEmpty(tags) ? (placeholder ?? 'app=frontend') : '',
    spellCheck: 'false',
    value: inputValue,
    ...inputProps,
  };

  return (
    <div className="pf-v6-c-form-control">
      <tags-input>
        <TagsInput
          addKeys={[13]}
          addOnBlur
          className="tags"
          inputProps={inputPropsWithDefaults}
          onChange={handleChange}
          ref={ref}
          removeKeys={isEmpty(inputValue) ? [] : [8]}
          renderTag={({ getTagDisplayValue, key, onRemove, tag }: RenderTagProps): ReactNode => (
            <PfLabel
              className={classNames('co-label tag-item-content', labelClassName)}
              data-test={`label=${key}`}
              key={key}
              onClose={() => onRemove(key)}
            >
              {getTagDisplayValue(tag)}
            </PfLabel>
          )}
          value={tags}
        />{' '}
      </tags-input>
    </div>
  );
};

export default SelectorInput;
