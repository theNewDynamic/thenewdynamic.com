class PersonPreview extends React.Component {
  render() {
    var entry = this.props.entry;
    return (
      <div className="p-4">
        <div className="pb-10">
          <h1 className="text-5xl font-normal">{ entry.getIn(['data', 'title']) }</h1>
          <div className="my-2">
            @{entry.getIn(['data', 'twitter_handle'])} | {entry.getIn(['data', 'job_title'])}
          </div>
        </div>
        <div className="my-4 user-content">
          {this.props.widgetFor('body')}
        </div>
      </div>
    )
  }
}

CMS.registerPreviewTemplate("persons", PersonPreview);