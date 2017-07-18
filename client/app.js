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
          this.toggleFile = this.toggleFile.bind(this);
          this.fileClick = this.fileClick.bind(this);
          this.downloadFile = this.downloadFile.bind(this);
        }

        componentDidMount() {
          this.fetchFiles();
        }

        fetchFiles() {
          axios.get('http://localhost:8080/api/files')
            .then(this.updateFiles)
            .catch(function (error) {
              console.log(error);
            });
        }

        updateFiles({ data }) {
          this.setState({ files: data });
          console.log('files', this.state.files);
        }

        uploadFile(e) {

        }
        createFolder(e) {
          e.preventDefault();
          const folderData = {
            name: this.state.newFolderName
          };

          console.log('folderData', folderData);
          axios.post('http://localhost:8080/api/folders', folderData)
            .then(this.fetchFiles)
            .catch(function (error) {
              console.log(error);
            });
        }
        updateNewFolderName(e) {
          this.setState({[e.target.name]: e.target.value});
          console.log('newFolderName', this.state.newFolderName);
        }
        createNewFolderForm(e) {
          this.setState({ showNewFolderForm: true });
        }

        toggleFile(e) {
          const toggledFolderState = this.state.toggledFolders;
          toggledFolderState[e.target.dataset.fileId] = true;
          this.setState({ toggledFolders: toggledFolderState })
          console.log('toggledFoldersState', this.state.toggledFolders);
        }
        fileClick(e) {
          const fileId = e.target.dataset.fileId;
          fetch(`http://localhost:8080/api/folders/${fileId}/items`)
            .then((data) => {
              return data.json();
            })
            .then(this.updateFiles)
            .catch((err) => {
              console.log(err);
            });
        }
        downloadFile(e) {
          const fileId = e.target.dataset.fileId;
          fetch(`http://localhost:8080/api/files/${fileId}/content`)
            .catch((err) => {
              console.log(err);
            });
        }

        render() {
          return (
            <div className="file-manager">
              <FileManagerHeader currentDirectory={this.state.currentDirectory} onCreateNewFolderForm={this.createNewFolderForm} onUploadFile={this.uploadFile} />
              <FileList files={this.state.files} onToggleFile={this.toggleFile} onFileClick={this.fileClick} onCreateFolder={this.createFolder} onUpdateNewFolderName={this.updateNewFolderName} showNewFolderForm={this.state.showNewFolderForm} />              
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

      const FileList = ({files, onToggleFile, onFileClick, showNewFolderForm, onCreateFolder, onUpdateNewFolderName, toggledFolders}) => {
        let fileList = files.map((file, index) => {
          let classNames = ''; // (toggledFolders[index]) ? 'toggled' : '';

          return <File key={index} index={index} classNames={classNames} file={file} onFileClick={onFileClick} />;
        });

        const createFolderFormClasses = classnames({'hidden': !showNewFolderForm})

        return (
          <ul className="file-list">
            <li>
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
        return (
          <li className={classNames}>
            <div className="create-new-folder">
              <form onSubmit={onCreateFolder} onChange={onUpdateNewFolderName}>
                <input id="new-folder-input" type="text" name="newFolderName" />
                <button type="submit" className="btn">Create</button>
              </form>
            </div>
          </li>
        );
      }

      const File = ({index, classNames, file, onFileClick}) => {

        return (
          <li className={classNames} data-index={index} onClick={onFileClick}>
            <div className="name" data-index={index}>{file.name}</div>
            <div className="type" data-index={index}>{file.type}</div>
            <div className="size" data-index={index}>{file.size}</div>
          </li>
        );
      }

      ReactDOM.render(<App />,
        document.getElementById('root')
      );