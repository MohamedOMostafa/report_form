import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import { includes } from 'lodash';
import { teachers, grades } from './reportData';
import './App.css';
import { array } from 'prop-types';

const styles = theme => ({
  container: {
    flexGrow: 1,
    display: 'flex',
    flexWrap: 'wrap',
    backgroundColor: '#eeeeee',
    height: 800
  },
  textField: {
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    width: 200,
  },
  smallTextField: {
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    width: 200,
  },
  menu: {
    width: 500,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  invalid: {
    borderColor: 'red'
  },
  button: {
    margin: theme.spacing.unit,
  }
});

class ReportForm extends Component {

  state = {
    teachers: [],
    grades: [],
    teacherClasses: [],
    chosenTeacher: '',
    name: '',
    date: '',
    evaluatedCourses: [],
    displayedCourses: []
  }

  handleChange(inputKey, event) {
    if (inputKey == 'chosenTeacher')
      this.handleTeacherChange(event.target.value);
    this.setState({
      [inputKey]: event.target.value
    });
  }

  handleTeacherChange(value) {
    const chosenTeacher = this.state.teachers.find(teacher => teacher.name == value);
    const teacherClasses = chosenTeacher.classes;
    this.setState({
      teacherClasses: teacherClasses,
      classes:
        [
          {
            id: 1,
            course: '',
            grade: '',
            comments: '',
            disabled: false
          }
        ],
      displayedCourses: teacherClasses,
      evaluatedCourses: []
    });
  }

  handleCourseChange() {
    const evaluatedCourses = [];
    const displayedCourses = [];
    this.state.classes.forEach(classItem => {
      evaluatedCourses.push(classItem.course);
    })
    this.state.teacherClasses.forEach((course, index) => {
      if (!includes(evaluatedCourses, course)) {
        displayedCourses.push(course);
      }
    });
    this.setState({
      evaluatedCourses,
      displayedCourses
    });
  }

  handleClassesChange(id, key, event) {
    this.setState({
      classes: this.state.classes.map(classItem => {
        if (classItem.id == id)
          return Object.assign({}, classItem, {
            [key]: event.target.value,
            disabled: key == 'course' ? true : classItem.disabled
          });
        else
          return classItem;
      })
    });
    if (key == 'course') {
      setTimeout(() => {
        this.handleCourseChange.call(this);
      }, 0);
    }
  }

  renderClasses() {
    return Array.isArray(this.state.classes) && this.state.classes.map((classItem) => this.renderClassRow(classItem.id));
  }

  renderCourseSelections(classItem) {
    if (classItem.disabled) {
      return (<MenuItem key={classItem.course} value={classItem.course} hidden={true}>
        {classItem.course}
      </MenuItem>);
    } else {
      return (this.state.displayedCourses.map(course => (
        <MenuItem key={course} value={course} hidden={true}>
          {course}
        </MenuItem>
      )));
    }
  }

  handleFormSubmit() {
    var result = {
      teacher: this.state.chosenTeacher,
      date: this.state.date,
      name: this.state.name,
      classes: this.state.classes
    }
    //Contact api with a post request here
    result = JSON.stringify(result);
  }

  renderClassRow(id) {
    const { classes } = this.props;
    const classItem = this.state.classes.find(classItem => classItem.id == id);
    return (
      <div key={classItem.id}>
        <TextField
          disabled={classItem.disabled}
          select
          label="Course"
          className={classes.smallTextField}
          value={classItem.course}
          onChange={this.handleClassesChange.bind(this, id, 'course')}
          SelectProps={{
            MenuProps: {
              className: classes.menu,
            },
          }}
          helperText="Please select your course"
          margin="normal"
        >
          {this.renderCourseSelections(classItem)}
        </TextField>
        <TextField
          select
          label="Grade"
          className={classes.smallTextField}
          onChange={this.handleClassesChange.bind(this, id, 'grade')}
          value={classItem.grade}
          SelectProps={{
            MenuProps: {
              className: classes.menu,
            },
          }}
          helperText="Please select your grade"
          margin="normal"
        >
          {this.state.grades.map(grade => (
            <MenuItem key={grade} value={grade}>
              {grade}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Comments"
          value={classItem.comments}
          className={classes.smallTextField}
          margin="normal"
          onChange={this.handleClassesChange.bind(this, id, 'comments')}
        />
        <Button variant="outlined" component="span" color="secondary" className={classes.button} onClick={this.handleClassRemove.bind(this, classItem.id)}>Remove</Button>
      </div>
    )
  }

  handleClassRemove(id) {
    const classItem = this.state.classes.find(classItem => classItem.id == id);
    this.setState({
      classes: this.state.classes.filter(classItem => classItem.id != id)
    });
    this.handleCourseChange.call(this);
  }

  removeFromClasses(collection, key) {
    const result = [];
    collection.forEach(item => {
      if (item != key)
        result.push(item);
    });
    return result;
  }

  handleAddNewLine() {
    this.setState({
      classes: this.state.classes.concat({
        id: this.state.classes[this.state.classes.length - 1].id + 1,
        class: '',
        grade: '',
        comments: ''
      })
    });
    console.log(this.state.classes);
  }

  componentDidMount() {
    this.setState({
      teachers, grades
    });
  }

  isAddingEnabled() {
    for (var i = 0; i < this.state.classes.length; i++) {
      if (!this.state.classes[i].course)
        return true;
    }
    if (this.state.displayedCourses.length == 0)
      return true;
    return false;
  }

  isFormValid() {
    const { name, chosenTeacher, date, classes } = this.state;
    if (!name || !chosenTeacher || !date)
      return true;
    for (var i = 0; i < classes.length; i++) {
      const { course, grade, comments } = classes[i];
      if (!course || !grade || !comments)
        return true;
    }
    return false;
  }

  render() {
    const { classes } = this.props;
    const bull = <span className={classes.bullet}>•</span>;
    return (
      <Grid container className={classes.container} spacing={16} justify='center'>
        <Grid item xs={8}>
          <Card className={classes.card}>
            <form noValidate autoComplete="off" className={classes.center}>
              <CardContent>
                <TextField
                  id="name"
                  label="Name"
                  className={classes.textField + ` ${classes.invalid}`}
                  margin="normal"
                  value={this.state.name}
                  onChange={this.handleChange.bind(this, 'name')}
                />
                <TextField
                  id="date"
                  type="date"
                  className={classes.textField}
                  margin="normal"
                  value={this.state.date}
                  onChange={this.handleChange.bind(this, 'date')}
                />
                <TextField
                  id="teacher"
                  select
                  label="Teacher"
                  value={this.state.chosenTeacher}
                  onChange={this.handleChange.bind(this, 'chosenTeacher')}
                  className={classes.textField}
                  SelectProps={{
                    MenuProps: {
                      className: classes.menu,
                    },
                  }}
                  helperText="Please select your teacher"
                  margin="normal"
                >
                  {this.state.teachers.map(teacher => (
                    <MenuItem key={teacher.id} value={teacher.name}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </TextField>
                <div className={classes.classesRow}>
                  {this.state.classes && this.state.classes.length > 0 && this.renderClasses()}
                </div>
              </CardContent>
            {this.state.classes && this.state.classes.length > 0 && <div style={{'text-align' : 'center'}}> <Button size="small" variant="outlined" onClick={this.handleAddNewLine.bind(this)}
                disabled={this.isAddingEnabled.call(this)}>Add new line</Button></div>}
              <CardActions>
                <Button variant="outlined" color="primary" size="small" onClick={this.handleFormSubmit.bind(this)}
                  disabled={this.isFormValid.call(this)}>Submit</Button>
              </CardActions>
            </form>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(ReportForm);
