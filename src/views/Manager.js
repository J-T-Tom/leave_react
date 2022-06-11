import { Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@material-ui/core'
import { Alert } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

export default function Manager() {
  const location = useLocation();
  const navigate = useNavigate();

  // if not login navigate to login page
  useEffect(() => {
    if(location.state == null){
      navigate("/")
    }
  }, []); 

  const [previousRequests, setPreviousRequests] = useState([]);
  // select all pending leave requests
  useEffect(() => {
    axios.get('http://localhost:4000/manager/get-pending-requests')
      .then(response => {
          setPreviousRequests(response.data.results)
          // console.log(response.data.results)
      });
  }, []); 

  const [holydays, setHolydays] = useState([]);
  const [holydayMessage, setHolydayMessage] = useState('');
  // select all pending leave requests
  useEffect(() => {
    axios.get('http://localhost:4000/manager/get-holydays')
      .then(response => {
          setHolydays(response.data.results)
          // console.log(response.data)
      });
  }, []); 

  // if not login don't render other fields
  if(location.state == null){
    return;
  }

  const changeLeaveStatus = (leaveId, status) => {
    const params = {
      leave_id: leaveId,
      status: status
    };
    axios.post('http://localhost:4000/manager/change-leave-status', params)
      .then(response => {
          setPreviousRequests(response.data.results)
          // console.log(response.data)
      });
  }

  const downloadAttachment = (fileURL) => {
		fetch('http://localhost:4000/uploads/' + fileURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/pdf',
      },
    })
    .then((response) => response.blob())
    .then((blob) => {
      // Create blob link to download
      const url = window.URL.createObjectURL(
        new Blob([blob]),
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        fileURL,
      );

      // Append to html link element page
      document.body.appendChild(link);

      // Start download
      link.click();

      // Clean up and remove the link
      link.parentNode.removeChild(link);
    });
	}
	
  function holydayFound(val) {
    return holydays.some(item => val === item.value);
  }

  return (
    <div style={{display: 'flex'}} >
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
        <div style={{display: 'flex', flexDirection: 'column', flex: '2',}}>
          <Typography gutterBottom variant="h5" component="div" align="left">
            Holydays
          </Typography>
          {
            holydays.map((data, i) => {
              return (
                <Alert key={i} onClose={() => {
                  const params = {
                    holyday: data.value
                  };

                  axios.post('http://localhost:4000/manager/remove-holyday', params)
                    .then(response => {
                        setHolydays(response.data.results)
                        // console.log(response.data)
                        setHolydayMessage('');
                    });
                }} severity="success" color="info">{data.value}</Alert>
              );
            })
          }
          <br/>
          <TextField
            label="Add Holyday"
            type="date"
            defaultValue={new Date()}
            // value={new Date(startDate)}
            // sx={{ width: 220 }}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(event) => {
              event.persist();
              var selectedDate = new Date(event.target.value);

              if(holydayFound(selectedDate.toISOString().split('T')[0])){
                setHolydayMessage('Already found');
              }
              else{
                const params = {
                  holyday: selectedDate.toISOString().split('T')[0]
                };

                axios.post('http://localhost:4000/manager/add-holyday', params)
                  .then(response => {
                      setHolydays(response.data.results)
                      // console.log(response.data.results)
                      setHolydayMessage('');
                  });
              }
            }}
          />
          {holydayMessage}
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
                      <div align="center">Employee ID - {data.employee_id}</div>
                      <div align="center">Employee Name - {data.full_name}</div>
                      <div align="center">Employee Gender - {data.gender}</div>
                      <div align="center">Employment Date - {new Date(data.employment_date).toDateString()}</div>
                      <div align="center">Leave Type - {data.leave_type}</div>
                      <div align="center">Start Date - {new Date(data.start_date).toDateString()}</div>
                      <div align="center">For {data.amount} Days</div>
                      <div align="center">
                        <br/>
                        <Button
                          variant="contained"
                          style={{
                            backgroundColor: '#036',
                            color: 'white',
                          }}
                          size="medium"                          
                          onClick={() => {
                            changeLeaveStatus(data.leave_id, 'Approved');
                          }}
                        >
                          <b>Approve</b>
                        </Button>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <Button
                          variant="contained"
                          style={{
                            backgroundColor: 'red',
                            color: 'white',
                          }}
                          onClick={() => {
                            changeLeaveStatus(data.leave_id, 'Rejected');
                          }}
                        >
                          <b>Reject</b>
                        </Button>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        {
                          data.leave_type === 'Legal Leave'
                            ? 
                              <Button
                                variant="contained"
                                style={{
                                  backgroundColor: 'red',
                                  color: 'white',
                                }}
                                onClick={() => {
                                  downloadAttachment(data.attached_file)
                                }}
                              >
                                <b>Attachment</b>
                              </Button>
                            : ''
                        }
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
        <div style={{display: 'flex', flexDirection: 'column', flex: '0.5',}}>
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
    </div>
  )
}
