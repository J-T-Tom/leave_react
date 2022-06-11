import { FormControl, InputLabel, MenuItem, Select, 
  Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
} from '@material-ui/core';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {useNavigate, useLocation} from 'react-router-dom';



const Employee = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // if not login navigate to login page
  useEffect(() => {
    if(location.state == null){
      navigate("/")
    }
  }, []); 


  const [holydays, setHolydays] = useState();
  // select all holydays
  useEffect(() => {
    axios.get('http://localhost:4000/employee/get-holydays')
      .then(response => {
          setHolydays(response.data.results)
          // console.log(response.data.results)
      });
  }, []); 

  const [previousRequests, setPreviousRequests] = useState([]);
  // select all leave requests
  useEffect(() => {
    const params = {
      employee_id: location.state.info.id
    };

    axios.post('http://localhost:4000/employee/get-all-requests', params)
      .then(response => {
          setPreviousRequests(response.data.results)
          // console.log(response.data.results)
      });
  }, []); 


  // if not login don't render other fields
  if(location.state == null){
    return;
  }
  
  // leave types
  const values = [
    'Normal Leave', 
    'Sick Leave', 
    'Women Prenatal Leave',
    'Women Postnatal Leave',
    'Men Paternal Leave',
    'Legal Leave'
  ];

  const [leaveType, setLeaveType] = useState('');
  const [leaveDaysCount, setLeaveDaysCount] = useState(1);
  const [showStartDate, setShowStartDate] = useState(false);
  const [startDate, setStartDate] = React.useState('');
  const [showSubmit, setShowSubmit] = React.useState(false);
  const [showNoOfLeaveDays, setShowNoOfLeaveDays] = React.useState(true);
  const [endDate, setEndDate] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [showAttachEvidence, setShowAttachEvidence] = React.useState(false);
  const [attachedFile, setAttachedFile] = React.useState();

  const [balance, setBalance] = useState({
    normal_leave: {approved: 0, pending: 0},
    sick_leave: {approved: 0, pending: 0},
    women_prenatal_leave: {approved: 0, pending: 0},
    women_postnatal_leave: {approved: 0, pending: 0},
    men_paternal_leave: {approved: 0, pending: 0},
    legal_leave: {approved: 0, pending: 0},
  });

  const handleLeaveTypeChange = event => {
    event.persist();
    // set to default 
    setLeaveDaysCount(1);
    setShowStartDate(false);
    setStartDate('');
    setShowSubmit(false);
    setEndDate('');
    setShowNoOfLeaveDays(true);
    setMessage('');
    setShowAttachEvidence(false);

    setLeaveType(event.target.value);

    const params = {
      info: location.state.info,
      leave_type: event.target.value
    };

    var balance_leave_name = '';
    if(event.target.value === 'Normal Leave')
      balance_leave_name = 'normal_leave';
    else if(event.target.value === 'Sick Leave')
      balance_leave_name = 'sick_leave';
    else if(event.target.value === 'Women Prenatal Leave')
      balance_leave_name = 'women_prenatal_leave';
    else if(event.target.value === 'Women Postnatal Leave')
      balance_leave_name = 'women_postnatal_leave';
    else if(event.target.value === 'Men Paternal Leave')
      balance_leave_name = 'men_paternal_leave';
    else if(event.target.value === 'Legal Leave')
      balance_leave_name = 'legal_leave';
    

    axios.post('http://localhost:4000/employee/check_balance', 
      params)
      .then(response => {
        setBalance(balance => ({
          ...balance,
          [balance_leave_name]: {
            approved: response.data.approve_sum[0].sum === undefined 
              ? -1 : response.data.approve_sum[0].sum,
            pending: response.data.pending_sum[0].sum === undefined
              ? -1 : response.data.pending_sum[0].sum
          }      
        }));
      });
  };

  const buildNumOfLeaveDaysTextField = (max_amount) => {
    return <TextField
        label='Number of Leave Days'
        name={'Number of Leave Days'}
        value={
          leaveType === 'Women Prenatal Leave' ? 30 
            : leaveType === 'Women Postnatal Leave'
                ? 90 : leaveDaysCount
        }
        type='number'
        // InputProps={{ inputProps: { min: "1", step: "1" } }}
        onChange={(event) => {
          event.persist();
          
          var min = 1; // for normal, sick and legal leave
          if(leaveType === 'Women Prenatal Leave'){
            min = 30;
          }
          else if(leaveType === 'Women Postnatal Leave'){
            min = 90;
          }
          else if(leaveType === 'Men Paternal Leave'){
            min = 5;
          }
          
          if(event.target.value >= min && event.target.value <= max_amount){
            setLeaveDaysCount(event.target.value)
          }
        }}
        variant="standard"
        size="small"
      />;
  }

  function CalculateWeekendDays(fromDate, toDate){
    var weekendDayCount = 0;

    while(fromDate < toDate){
        if(fromDate.getDay() === 0 || fromDate.getDay() === 6){
            ++weekendDayCount ;
        }
        fromDate.setDate(fromDate.getDate() + 1);
    }

    return weekendDayCount ;
  }

  function holydayFound(val) {
      return holydays.some(item => val === item.value);
  }
  function CalculateHolydays(fromDate, toDate){
    var holydayCount = 0;
    while(fromDate < toDate){
        if(fromDate.getDay() !== 0 && fromDate.getDay() !== 6){
          if(holydayFound(fromDate.toISOString().split('T')[0])){
            ++holydayCount ;
          }
        }
        fromDate.setDate(fromDate.getDate() + 1);
    }

    return holydayCount ;
  }

  const buildStartDateChooser = () => {
    return <TextField
        label="Start Date"
        type="date"
        defaultValue={new Date()}
        // value={new Date(startDate)}
        // sx={{ width: 220 }}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={(event) => {
          event.persist();
          var now = new Date();
          var selectedDate = new Date(event.target.value);

          if(selectedDate >= now){
            setStartDate(event.target.value);

            var endDate = new Date(
              selectedDate.setTime( selectedDate.getTime() + leaveDaysCount * 86400000 ));
            
            if(leaveType === 'Normal Leave') {
              // calculate number of saturday and sunday
              var weekendCount = CalculateWeekendDays(new Date(event.target.value), endDate)
              
              endDate = new Date(
                selectedDate.setTime( selectedDate.getTime() + weekendCount * 86400000 ));
              
              // calculate number of holydays
              var holydayCount = CalculateHolydays(new Date(event.target.value), endDate);
              
              endDate = new Date(
                selectedDate.setTime( selectedDate.getTime() + holydayCount * 86400000 ));

              setMessage('Weekend count - '+ weekendCount + 
                    ' \n Holyday count - '+ holydayCount);
            }
            
            setEndDate(endDate.toDateString());

            // check if endDay is outside budget year
            if(endDate.getFullYear() === 2023 && endDate.getUTCMonth() > 5) {
              setMessage('End Date is outside of budget year.');
              setShowSubmit(false);
            }
            else {
              setShowSubmit(true);
              if(leaveType === 'Legal Leave')
                setShowAttachEvidence(true);
            }
          }
        }}
      />;
  }

  const calculateRemainingDate =  (approved) => {
    if(leaveType === 'Normal Leave'){
      return (15 - approved);
    }
    else if(leaveType === 'Sick Leave'){
      return (90 - approved);
    }
    else if(leaveType === 'Women Prenatal Leave'){
      return (30);
    }
    else if(leaveType === 'Women Postnatal Leave'){
      return (90);
    }
    else if(leaveType === 'Legal Leave'){
      return (7 - approved);
    }
  }

  const updatePendingView = () => {
    const params = {
      employee_id: location.state.info.id
    };

    axios.post('http://localhost:4000/employee/get-all-requests', params)
      .then(response => {
          setPreviousRequests(response.data.results)
          // console.log(response.data.results)
      });
  }

  const hideLeaveRequest = (leaveId) => {
    const params = {
      employee_id: location.state.info.id,
      leave_id: leaveId
    };
    axios.post('http://localhost:4000/employee/hide-leave-request', params)
      .then(response => {
          setPreviousRequests(response.data.results)
          // console.log(response.data)
      });
  }

  const buildIndividualBalance = (approved, pending) => {
    var remaining = calculateRemainingDate (approved);
    return (
      <div>
        <Card sx={{ maxWidth: 345 }}>
          <CardContent>
            <List sx={{ width: '100%', maxWidth: 360, bgColor: 'background.paper' }}>
              <ListItem>
                <ListItemText primary='Approved' />
                <ListItemText primary={approved} style={{textAlign: 'end'}}/>
              </ListItem>
              <ListItem>
                <ListItemText primary='Pending' />
                <ListItemText primary={pending}  style={{textAlign: 'end'}}/>
              </ListItem>
              <ListItem>
                <ListItemText primary='Maximum days you have' />
                <ListItemText primary={remaining}  
                  style={{textAlign: 'end'}}/>
              </ListItem>
              <ListItem>                
                <ListItemText>
                  {remaining > 0 
                    ? showNoOfLeaveDays ? buildNumOfLeaveDaysTextField(remaining) : ''
                    : 'You have finished your Normal Leave.'}
                </ListItemText>
                <ListItemText style={{textAlign: 'end'}}>
                  { remaining > 0 
                    ? showNoOfLeaveDays 
                      ? <Button
                          style={{
                            backgroundColor: '#fafafa',
                            color: '#036',
                          }}
                          size="medium"
                          type="button"
                          variant="contained"
                          onClick={() => {
                            setShowStartDate(true);
                          }}
                        > Next </Button> 
                      : ''
                    : null}
                </ListItemText>
              </ListItem>
              <ListItem>
                <ListItemText>
                  {showStartDate ? buildStartDateChooser() : null}
                  <br/>
                  {showStartDate ? 'End Date - '+endDate : ''}
                  <br/>
                  <div style={{whiteSpace: 'pre-line'}}>
                    {message}
                  </div>
                </ListItemText>
                <ListItemText style={{textAlign: 'end'}}>
                  {
                    showSubmit && showAttachEvidence 
                      ? <Button
                          variant="text"
                          component="label"
                        >
                          Attach File
                          <input
                            type="file"
                            onChange={(event) => {
                              setAttachedFile(event.target.files[0])
                            }}
                            hidden
                          />
                        </Button>
                      : ''
                  }&nbsp;&nbsp;
                  {showSubmit ? <Button
                      style={{
                        backgroundColor: '#036',
                        color: '#fafafa',
                      }}
                      size="medium"
                      type="button"
                      variant="contained"
                      onClick={() => {
                        // change leave day for default leave types
                        var leave_days_count = leaveDaysCount;
                        if(leaveType === 'Women Prenatal Leave'){
                          leave_days_count = 30;
                        }
                        else if(leaveType === 'Women Postnatal Leave'){
                          leave_days_count = 90;
                        }
                        else if(leaveType === 'Men Paternal Leave'){
                          leave_days_count = 5;
                        }
                        const params = {
                          employee_id: location.state.info.id,
                          leave_type: leaveType,
                          start_date: startDate,
                          leave_days_count: leave_days_count,
                          attached_file: leaveType === 'Legal Leave' ? attachedFile : ''
                        };
                        const config = {
                            headers: {
                                'content-type': 'multipart/form-data'
                            }
                        }

                        if(leaveType === 'Legal Leave' && attachedFile === undefined){
                          setMessage('Attachment is required');
                          return;
                        }

                        axios.post('http://localhost:4000/employee/add-leave', 
                          params, config)
                          .then(response => {
                            // console.log(response.data)
                            // set to default 
                            setLeaveDaysCount(1);
                            setShowStartDate(false);
                            setStartDate('');
                            setShowSubmit(false);
                            setEndDate('');
                            setShowNoOfLeaveDays(false);
                            setShowAttachEvidence(false);
                            setAttachedFile();
                            setMessage('Your leave request is sent to HR Manager');
                            updatePendingView();
                          });
                      }}
                    > Submit </Button>
                  : null }
                </ListItemText>
              </ListItem>
            </List>
          </CardContent>
        </Card>
        
      </div>
    );
  }
  const buildBalance = () => {
    var gender = location.state.info.gender;
    if(leaveType === 'Normal Leave'){
      return buildIndividualBalance(
          balance.normal_leave.approved,
          balance.normal_leave.pending);
    }
    else if(leaveType === 'Sick Leave'){
      return buildIndividualBalance(
          balance.sick_leave.approved,
          balance.sick_leave.pending);
    }
    else if(leaveType === 'Women Prenatal Leave' && gender === 'Female'){
      return buildIndividualBalance(
          balance.women_prenatal_leave.approved,
          balance.women_prenatal_leave.pending);
    }
    else if(leaveType === 'Women Postnatal Leave' && gender === 'Female'){
      return buildIndividualBalance(
          balance.women_postnatal_leave.approved,
          balance.women_postnatal_leave.pending);
    }
    else if(leaveType === 'Men Paternal Leave' && gender === 'Male'){
      return buildIndividualBalance(
          balance.men_paternal_leave.approved,
          balance.men_paternal_leave.pending);
    }
    else if(leaveType === 'Legal Leave'){
      return buildIndividualBalance(
          balance.legal_leave.approved,
          balance.legal_leave.pending);
    }
  }  

  return (
    <div>
      <form style={{display: 'flex'}} >
        <div style={{flex: '3'}}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell align="center" colSpan={2}>
                  H e l l o &nbsp;&nbsp; <b>{location.state.info.full_name}</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="center">Employee ID</TableCell>
                <TableCell align="center">{location.state.info.id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center">Gender</TableCell>
                <TableCell align="center">{location.state.info.gender}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center">Employment Date</TableCell>
                <TableCell align="center">{new Date(location.state.info.employment_date).toDateString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center">Role</TableCell>
                <TableCell align="center">{location.state.info.role}</TableCell>
              </TableRow>
            </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', flex: '0.2',}}></div>
        <div style={{display: 'flex', flexDirection: 'column', flex: '3',}}>
          <Typography gutterBottom variant="h5" component="div" align="center">
            Your Previous Leave Request
          </Typography>
          <div>
            {
              previousRequests.map((data, i) => {
                var color = '';
                if(data.status === 'Approved')
                  color = '#5bd28c';
                else if(data.status === 'Pending')
                  color = '#f89117';
                else if(data.status === 'Rejected')
                  color = '#fd5f72';
                  
                return(  
                  <div key={i}>
                  <Card style={{background: color}}>
                    <CardContent>
                    <br/>
                      <div align="center">{data.leave_type}</div>
                      <div align="center">{new Date(data.start_date).toDateString()}</div>
                      <div align="center">For {data.amount}</div>
                      <div align="center">
                        <Button
                          variant="text"
                          onClick={() => {
                            hideLeaveRequest(data.leave_id);
                          }}
                        >
                          <b>Hide</b>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <br/>
                  </div>
                );
              })
            }
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', flex: '0.2',}}></div>
        <div style={{display: 'flex', flexDirection: 'column', flex: '4',}}>
          <FormControl fullWidth>
            <InputLabel id="leave_type_label">Select Leave Type</InputLabel>
            <Select
              labelId="leave_type_label"
              value={leaveType}
              label="Leave Type"
              name='leave_type'
              onChange={handleLeaveTypeChange}
            >
              {values.map((value) => (
                <MenuItem value={value} key={value}>{value}</MenuItem>
              ))}
            </Select>
            
            { buildBalance() }
          </FormControl>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', flex: '1',}}>
          <Button
            variant="text"
            onClick={() => {
              navigate('/');
            }}
          >
            <b>Logout</b>
          </Button>
        </div>
        <div style={{flex: '3'}}>
          <Card sx={{ maxWidth: 345 }}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Normal Leave
              </Typography>
              <Typography variant="body2">
                All employees have 15 days (working days) of leave per budget year (budget year starts
                from July 01 to June 30)
              </Typography>
              <br/>
              <Typography gutterBottom variant="h5" component="div">
                Sick Leave
              </Typography>
              <Typography variant="body2">
                All employees have a total of 3 months (including weekdays
                and holidays) for sick leave within a year
              </Typography>
              <br/>
              <Typography gutterBottom variant="h5" component="div">
                Women Prenatal Leave
              </Typography>
              <Typography variant="body2">
                Women have prenatal leave (before giving birth) for 1 month
              </Typography>
              <br/>
              <Typography gutterBottom variant="h5" component="div">
                Women Postnatal Leave
              </Typography>
              <Typography variant="body2">
                Women have postnatal leave (after giving birth) for 3 months
              </Typography>
              <br/>
              <Typography gutterBottom variant="h5" component="div">
                Men Paternal Leave
              </Typography>
              <Typography variant="body2">
                Men employees have 5 days of paternal leave
              </Typography>
              <br/>
              <Typography gutterBottom variant="h5" component="div">
                Legal Leave
              </Typography>
              <Typography variant="body2">
                All employees have 7 days of legal-related leave and they need to attach their evidence
                when requesting legal leave.
              </Typography>
            </CardContent>
          </Card>
        </div>
        
      </form>
    </div>
  );
};

export default Employee;