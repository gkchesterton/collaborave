Collaborave.Views.Region = Backbone.View.extend({
	initialize: function (options) {
		this.height = options.height;
		if (this.model.buffer) {
			this.width = 817 * (this.model.buffer.duration/context.duration);
			this.offset = 817 * (parseFloat(this.model.get('start_time'))/context.duration);
		}
	},
	delete: function () {
		if (context.playing) {
      Collaborave.currentProject.pause();
    }
		this.model.destroy();
	},
	events: {
		'click button.delete-region': 'delete'
	},
	template: JST['regions/show'],
	render: function () {
		var regionView = this;
		var region = this.model;
		var content = this.template({region: this.model, height: this.height, width: this.width, offset: this.offset});
		this.$el.html(content);
		this.$el.addClass('region-div');
		this.model.context = this.$el.find('canvas').get()[0].getContext("2d");
		if (this.model.buffer) {
			this.model.drawBuffer(this.width, this.height, this.offset);
		}
		if (!this.model.id) {
			this.$el.find('button.delete-region').attr('disabled', 'disabled');
		}
		this.model.height = this.height;
		return this.$el
	}	
});