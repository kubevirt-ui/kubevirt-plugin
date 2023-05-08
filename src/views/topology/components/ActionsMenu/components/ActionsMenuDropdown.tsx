import classNames from 'classnames';
import { PropTypes } from 'prop-types';

Dropdown.propTypes = {
  actionItems: PropTypes.arrayOf(
    PropTypes.shape({
      actionKey: PropTypes.string,
      actionTitle: PropTypes.string,
    }),
  ),
  autocompleteFilter: PropTypes.func,
  autocompletePlaceholder: PropTypes.string,
  canFavorite: PropTypes.bool,
  className: PropTypes.string,
  dropDownClassName: PropTypes.string,
  enableBookmarks: PropTypes.bool,
  headerBefore: PropTypes.objectOf(PropTypes.string),
  items: PropTypes.object.isRequired,
  menuClassName: PropTypes.string,
  buttonClassName: PropTypes.string,
  noSelection: PropTypes.bool,
  userSettingsPrefix: PropTypes.string,
  storageKey: PropTypes.string,
  spacerBefore: PropTypes.instanceOf(Set),
  textFilter: PropTypes.string,
  title: PropTypes.node,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  onChange: PropTypes.func,
  selectedKey: PropTypes.string,
  titlePrefix: PropTypes.string,
  ariaLabel: PropTypes.string,
  name: PropTypes.string,
  autoSelect: PropTypes.bool,
  describedBy: PropTypes.string,
  required: PropTypes.bool,
  dataTest: PropTypes.string,
};

class ActionsMenuDropdown_ extends DropdownMixin {
  render() {
    const { actions, title = undefined, t } = this.props;
    const onClick = (event, option) => {
      event.preventDefault();

      if (option.callback) {
        option.callback();
      }

      if (option.href) {
        history.push(option.href);
      }

      this.hide();
    };
    return (
      <div
        ref={this.dropdownElement}
        className={classNames({
          'co-actions-menu pf-c-dropdown': true,
          'pf-m-expanded': this.state.active,
        })}
      >
        <button
          type="button"
          aria-haspopup="true"
          aria-label={t('public~Actions')}
          aria-expanded={this.state.active}
          className="pf-c-dropdown__toggle"
          onClick={this.toggle}
          data-test-id="actions-menu-button"
        >
          <span className="pf-c-dropdown__toggle-text">{title || t('public~Actions')}</span>
          <CaretDownIcon className="pf-c-dropdown__toggle-icon" />
        </button>
        {this.state.active && <KebabItems options={actions} onClick={onClick} />}
      </div>
    );
  }
}

const ActionsMenuDropdown = withTranslation()(ActionsMenuDropdown_);
