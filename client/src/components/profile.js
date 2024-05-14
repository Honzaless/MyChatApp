import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios';
import "./profile.css"
import { UserContext } from './userContext';

export default function Profile() {
    const [imageUrl, setImageUrl] = useState("");
    // const [photos, setPhotos] = useState({}); I might get to finish this
    const [name, setName] = useState("");
    const [work, setWork] = useState("");
    const [university, setUniversity] = useState("");
    const [school, setSchool] = useState("");
    const [workEdit, setWorkEdit] = useState("");
    const [universityEdit, setUniversityEdit] = useState("");
    const [schoolEdit, setSchoolEdit] = useState("");
    const [editAbout, setEditAbout] = useState(false);

    const { id } = useContext(UserContext);
    const profileId = useParams().id;

    useEffect(() => {
        const fetchProfilePic = async () => {
            try {
              const response = await axios.get(`/image/${profileId}`, { responseType: 'blob' });
              const imageBlob = response.data;
              const imageObjectURL = URL.createObjectURL(imageBlob);
              setImageUrl(imageObjectURL);
            } catch (error) {
              console.error('Error fetching image:', error);
            }
          };
      
          fetchProfilePic();
    }, [profileId]);

    useEffect(() => {
        async function getName() {
            try {
                const response = await axios.get(`/name/${profileId}`);
                setName(response.data.username);
            } catch (error) {
                console.log(error);
            }
        }
        getName();
    }, [profileId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!event.target.files[0]) {
          alert('Please select an image to upload.');
          return;
        }
    
        const formData = new FormData();
        formData.append('uploadedFile', event.target.files[0]);
        formData.append('userId', id);
    
        try {
          await axios.post('/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          console.log('Image uploaded successfully!');
          window.location.reload();
        } catch (error) {
          console.log('Error uploading image:', error);
        }
    };

    const handleAbout = async () => {
        setEditAbout(!editAbout);
        try {
            await axios.post("about", {"id": id, workEdit, universityEdit, schoolEdit});
            getAbout();
        } catch (error) {
            console.log(error);
        }
    };

    async function getAbout() {
        try {
            const response = await axios.get(`/about/${profileId}`);
            setWork(response.data.work);
            setUniversity(response.data.university);
            setSchool(response.data.school);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getAbout();
    });

  return (
    <div>
        <div className='profile-background'>
            <div className='profile-information'>
                <div className='profile-main'>
                    <label>
                        {imageUrl ? <img className={'profile-picture ' + (id === profileId ? "t" : "f")} src={imageUrl} alt="profile-icon"></img>
                        :
                        <img className={'profile-picture ' + (id === profileId ? "t" : "f")} src="https://cdn-icons-png.flaticon.com/128/1144/1144760.png" alt="profile-icon"></img>}
                        {id === profileId ?
                        <input type="file" accept="image/*" onChange={handleSubmit} id="profile-input"></input>
                        :
                        <div></div>
                        }
                    </label>
                    <h1 className='profile-name'>{name}</h1>
                </div>
            </div>
        </div>
        <div className='bottom-background'>
            <div className='information-container'>
                <div className='about-container'>
                    <div className="about-header">
                        <h2>About</h2>
                        {profileId === id ?
                        <button className='edit-profile' onClick={() => setEditAbout(!editAbout)}>{editAbout ? "Cancel" : "Edit Profile"}</button>
                        :
                        <div></div>}
                    </div>
                    {!editAbout ?
                    <div className='about'>
                        <div className='about-member'>
                            <h3>Work</h3>
                            <div className='about-information'>
                                <img className='icon' src='https://cdn-icons-png.flaticon.com/128/6964/6964169.png' alt='work-icon'></img>
                                <p>{work === "" ? "No workplaces to show" : work}</p>
                            </div>
                        </div>
                        <div className='about-member'>
                            <h3>University</h3>
                            <div className='about-information'>
                                <img className="icon" src='https://cdn-icons-png.flaticon.com/128/2790/2790260.png' alt='university-icon'></img>
                                <p>{university === "" ? "No schools/universities to show" : university}</p>
                            </div>
                        </div>
                        <div className='about-member'>
                            <h3>High School</h3>
                            <div className='about-information'>
                                <img className='icon' src='https://cdn-icons-png.flaticon.com/128/2790/2790260.png' alt='high-school-icon'></img>
                                <p>{school === "" ? "No schools/universities to show" : school}</p>
                            </div>
                        </div>
                    </div>
                    :
                    <div>
                        <div className='about-member'>
                            <h3>Work</h3>
                            <div className='about-information'>
                                <img className='icon' src='https://cdn-icons-png.flaticon.com/128/6964/6964169.png' alt='work-icon'></img>
                                <input type='text' value={workEdit} onChange={event => setWorkEdit(event.target.value)} placeholder='Work...' className='about-input'></input>
                            </div>
                        </div>
                        <div className='about-member'>
                            <h3>University</h3>
                            <div className='about-information'>
                                <img className="icon" src='https://cdn-icons-png.flaticon.com/128/2790/2790260.png' alt='university-icon'></img>
                                <input type='text' value={universityEdit} onChange={event => setUniversityEdit(event.target.value)} placeholder='University...' className='about-input'></input>
                            </div>
                        </div>
                        <div className='about-member'>
                            <h3>High School</h3>
                            <div className='about-information'>
                                <img className='icon' src='https://cdn-icons-png.flaticon.com/128/2790/2790260.png' alt='high-school-icon'></img>
                                <input type='text' value={schoolEdit} onChange={event => setSchoolEdit(event.target.value)} placeholder='High School...' className='about-input'></input>
                                <button className='about-submit' onClick={handleAbout}>Save</button>
                            </div>
                        </div>
                    </div>
                    }
                </div>
                <div className='photos-container'>
                    <div className='photos-header'>
                        <h2>Photos</h2>
                        <button className='show-all-pictures'>See All Photos</button>
                    </div>
                    <div className='inner-photos-container'>
                        <p>I have yet to finish this part</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
