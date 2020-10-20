class ApplicationController < ActionController::API
    include UsersHelper
    include AuthHelper

    def checkAccessToken
        if @user = User.find_by(id: params[:id])
            token = getToken(request.headers)
            if @user.token == User.digest(token)
                return @user
            else
                @user = false
            end
        end
    end

end
