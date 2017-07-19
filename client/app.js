import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import axios from 'axios';

      const App = () => {
        return (
          <div id="content">
            <AppLogo />
            <FileManager />
          </div>
        );
      }

      const AppLogo = () => {
        return (
          <div className="header">
            <h1>BuildingConnected: File Manager</h1>
          </div>
        );
      }

      class FileManager extends React.Component {
        constructor(props) {
          super(props);
          this.state = { 
            files: [],
            currentFolderId: '',
            currentDirectory: '/', 
            toggledFolders: {},
            showNewFolderForm: false,
            newFolderName: ''
          };
          this.fetchFiles = this.fetchFiles.bind(this);
          this.updateFiles = this.updateFiles.bind(this);
          this.uploadFile = this.uploadFile.bind(this);
          this.createFolder = this.createFolder.bind(this);
          this.createNewFolderForm = this.createNewFolderForm.bind(this);
          this.updateNewFolderName = this.updateNewFolderName.bind(this);
          this.toggleFolder = this.toggleFolder.bind(this);
          this.folderClick = this.folderClick.bind(this);
          this.downloadFile = this.downloadFile.bind(this);
        }

        componentDidMount() {
          this.fetchFiles();
        }

        fetchFiles() {
          const folderId = this.state.currentFolderId;
          if (folderId) {
            axios.get(`http://localhost:8080/api/folders/${folderId}/items`)
            .then(this.updateFiles)
            .catch(function (error) {
              console.log(error);
            });
          }
          else {
            axios.get(`http://localhost:8080/api/files`)
              .then(this.updateFiles)
              .catch(function (error) {
                console.log(error);
              });
          }
        }
        updateFiles({ data }) {
          this.setState({ files: data });
          console.log('state', this.state);
        }

        createFolder(e) {
          e.preventDefault();
          const newFolderName = this.state.newFolderName.trim();
          if (newFolderName === '') {
            alert('Folder name cannot be empty!');
            return;
          }

          const folderData = {
            name: newFolderName
          };

          this.setState({ newFolderName: '', showNewFolderForm: false });

          axios.post(`http://localhost:8080/api/folders?parentId=${this.state.currentFolderId}`, folderData)
            .then(this.fetchFiles)
            .catch(function (error) {
              console.log(error);
            });
        }
        uploadFile(e) {

        }
        updateNewFolderName(e) {
          this.setState({ [e.target.name]: e.target.value });
        }
        createNewFolderForm(e) {
          this.setState({ showNewFolderForm: true });
        }
        toggleFolder(e) {
          const toggledFolderState = this.state.toggledFolders;
          toggledFolderState[e.target.dataset.fileId] = true;
          this.setState({ toggledFolders: toggledFolderState })
          console.log('toggledFoldersState', this.state.toggledFolders);
        }
        folderClick(e) {
          const dataset = e.target.dataset;

          this.setState({ 
            isLoadingFiles: true, 
            currentFolderId: dataset.fileId,
            currentDirectory: `${this.state.currentDirectory}${dataset.fileName}/`
          });

          axios.get(`http://localhost:8080/api/folders/${dataset.fileId}/items`)
            .then(this.updateFiles)
            .catch((err) => {
              console.log(err);
            });
        }
        downloadFile(e) {
          const fileId = e.target.dataset.fileId;
          axios.get(`http://localhost:8080/api/files/${fileId}/content`)
            .catch((err) => {
              console.log(err);
            });
        }

        render() {
          return (
            <div className="file-manager">
              <FileManagerHeader currentDirectory={this.state.currentDirectory} onCreateNewFolderForm={this.createNewFolderForm} onUploadFile={this.uploadFile} />
              <FileList files={this.state.files} onToggleFolder={this.toggleFolder} onFolderClick={this.folderClick} onCreateFolder={this.createFolder} onUpdateNewFolderName={this.updateNewFolderName} showNewFolderForm={this.state.showNewFolderForm} />              
            </div>
          );          
        }
      }

      const FileManagerHeader = ({currentDirectory, onCreateNewFolderForm, onUploadFile}) => {
        return (
          <div className="file-header">
            <DirectoryMenu directory={currentDirectory} />
            <FileManagerActions onCreateNewFolderForm={onCreateNewFolderForm} onUploadFile={onUploadFile}/>
          </div>
        );
      }

      const DirectoryMenu = ({directory}) => {
        return (
          <div className="directory-menu">
            <label>Directory:</label>
            <div>{directory}</div>
          </div>
        );
      }

      const FileManagerActions = ({onCreateNewFolderForm, onUploadFile}) => {
        return (
          <div className="actions">
            <Button onClick={onCreateNewFolderForm} text={'New Folder'} classNames={'btn'} />
            <Button onClick={onUploadFile} text={'Upload File'} classNames={'btn'} />
          </div>
        );
      }

      const Button = ({text, onClick, classNames}) => {
        return (
          <button className={classNames} onClick={onClick}>{text}</button>
        );
      }

      const FileList = ({files, onToggleFolder, onFolderClick, showNewFolderForm, onCreateFolder, onUpdateNewFolderName, toggledFolders}) => {
        let fileList = files.map((file, index) => {
          let classNames = ''; // (toggledFolders[index]) ? 'toggled' : '';

          return <File key={index} index={index} classNames={classNames} file={file} onFolderClick={onFolderClick} />;
        });

        const createFolderFormClasses = classnames({'hidden': !showNewFolderForm})

        return (
          <ul className="file-list">
            <li className="heading">
              <div className="name">Name</div>
              <div className="type">Type</div>
              <div className="size">Size</div>
            </li>
            <CreateFolderForm classNames={createFolderFormClasses} onCreateFolder={onCreateFolder} onUpdateNewFolderName={onUpdateNewFolderName} />
            { fileList }
          </ul>
        );
      }

      const CreateFolderForm = ({classNames, onCreateFolder, onUpdateNewFolderName}) => {
        let textInput = null;

        function handleCreateClick() {
          textInput.value = '';
        }

        return (
          <li className={classNames}>
            <div className="create-new-folder">
              <form onSubmit={onCreateFolder} onChange={onUpdateNewFolderName}>
                <input id="new-folder-input" type="text" name="newFolderName" placeholder="New folder name" ref={(input) => { textInput = input; }} />
                <button type="submit" className="btn" onClick={handleCreateClick}>Create</button>
              </form>
            </div>
          </li>
        );
      }

      const File = ({index, classNames, file, onFolderClick}) => {
        let handleOnClick;
        
        if (file.type === 'FOLDER')
          handleOnClick = onFolderClick

        return (
          <li className={classNames} data-file-id={file._id} data-file-name={file.name} data-file-type={file.type} onClick={handleOnClick}>
            <div className="name" data-file-id={file._id} data-file-name={file.name} data-file-type={file.type}>{file.name}</div>
            <div className="type">{file.type}</div>
            <div className="size">{file.size}</div>
          </li>
        );
      }

      ReactDOM.render(<App />,
        document.getElementById('root')
      );