import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { Col, Image } from 'react-bootstrap';

import SidePanel from './Side-Panel.jsx';
import ToolPanel from './Tool-Panel.jsx';
import BugModal from '../../Bug-Modal.jsx';

import { userSelector } from '../../../../redux';
import { challengeMetaSelector } from '../../redux';
import { challengeSelector } from '../../../../redux';

const mapStateToProps = createSelector(
  userSelector,
  challengeSelector,
  challengeMetaSelector,
  (
    { challengeMap: userChallengeMap },
    {
      id,
      description,
      image
    },
    { title }
  ) => {

    const isCompleted = userChallengeMap ? !!userChallengeMap[id] : false;

    return {
      id,
      image,
      title,
      isCompleted,
      description
    };
  }
);
const propTypes = {
  description: PropTypes.arrayOf(PropTypes.string),
  id: PropTypes.string,
  image: PropTypes.string,
  isCompleted: PropTypes.bool,
  title: PropTypes.string
};

export class Project extends PureComponent {
  render() {
    const {
      id,
      title,
      image,
      isCompleted,
      description
    } = this.props;
    
    return (
      <Col
        md={ 8 }
        xs={ 12 }
        >
        <SidePanel
          description={ description }
          isCompleted={ isCompleted }
          title={ title }
        />
        <br />
        <ToolPanel />
      </Col>
    );
  }
}

Project.displayName = 'Project';
Project.propTypes = propTypes;

export default connect(
  mapStateToProps
)(Project);
